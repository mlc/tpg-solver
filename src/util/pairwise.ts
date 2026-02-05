import { type Coord, earthRadius } from '@turf/helpers';
import { getCoords } from '@turf/invariant';
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Point,
} from 'geojson';
import { Heap } from 'mnemonist';

const LEAF = 32;

type Vec3 = readonly [number, number, number];

const pointToVec3 = (p: Coord): Vec3 => {
  const [lngD, latD] = getCoords(p);

  const lng = (lngD * Math.PI) / 180;
  const lat = (latD * Math.PI) / 180;
  const clat = Math.cos(lat);
  return [clat * Math.cos(lng), clat * Math.sin(lng), Math.sin(lat)];
};

interface Node {
  idx: readonly number[];
  left?: Node;
  right?: Node;
  c: Vec3;
  R: number;
  isLeaf: boolean;
}

interface PairItem {
  A: Node;
  B: Node;
  ub: number;
}

const addVec3 = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

const subVec3 = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];

const divVec3 = (a: Vec3, b: number): Vec3 => [a[0] / b, a[1] / b, a[2] / b];

const norm2 = (v: Vec3): number => v.reduce((acc, x) => acc + x * x, 0);
const norm = (v: Vec3): number => Math.sqrt(norm2(v));

const dot = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const computeCenterAndRadius = (
  points: readonly Vec3[],
  idx: readonly number[]
) => {
  const mean = idx.reduce<Vec3>((acc, i) => addVec3(acc, points[i]), [0, 0, 0]);

  const normMean = norm(mean);
  let c: Vec3;
  if (normMean === 0) {
    c = points[idx[0]];
  } else {
    c = divVec3(mean, normMean);
  }

  const R = Math.max(...idx.map((i) => norm(subVec3(points[i], c))));
  return { c, R };
};

const splitIndices = (points: readonly Vec3[], idx: readonly number[]) => {
  let a = idx[0];
  let b = a;
  let best = -Infinity;
  for (const i of idx) {
    const d = norm2(subVec3(points[i], points[a]));
    if (d > best) {
      best = d;
      b = i;
    }
  }

  let c = b;
  best = -Infinity;
  for (const i of idx) {
    const d = norm2(subVec3(points[i], points[b]));
    if (d > best) {
      best = d;
      c = i;
    }
  }

  let L: number[] = [];
  let R: number[] = [];
  for (const i of idx) {
    if (
      norm2(subVec3(points[i], points[b])) <
      norm2(subVec3(points[i], points[c]))
    ) {
      L.push(i);
    } else {
      R.push(i);
    }
  }

  if (L.length === 0 || R.length === 0) {
    const sortedIndices = [...idx].sort((a, b) => points[a][0] - points[b][0]);
    const mid = Math.floor(sortedIndices.length / 2);
    L = sortedIndices.slice(0, mid);
    R = sortedIndices.slice(mid);
  }
  return { L, R };
};

const buildBallTree = (
  points: readonly Vec3[],
  idxList: readonly number[]
): Node => {
  const idx = idxList;
  const { c, R } = computeCenterAndRadius(points, idxList);

  if (idx.length <= LEAF) {
    return { idx, c, R, isLeaf: true };
  }

  const { L: left, R: right } = splitIndices(points, idx);
  return {
    idx,
    c,
    R,
    left: buildBallTree(points, left),
    right: buildBallTree(points, right),
    isLeaf: false,
  };
};

const upperBound = (A: Node, B: Node, T: Vec3) => {
  const csum = addVec3(A.c, B.c);
  const delta = A.R + B.R;

  const cnorm = norm(csum);
  if (cnorm <= delta) {
    return 1.0;
  }

  const cpar = dot(T, csum);
  const cperp2 = Math.max(0, cnorm * cnorm - cpar * cpar);
  const cperp = Math.sqrt(cperp2);

  const cparP = cpar + delta;
  const cperpP = Math.max(0, cperp - delta);

  const denom = Math.sqrt(cparP * cparP + cperpP * cperpP);
  if (denom === 0) {
    return 1;
  } else {
    return cparP / denom;
  }
};

interface MinParams {
  cosThetaMin?: number;
  chordMin?: number;
}

const computeMinParams = (minDistance?: number): MinParams => {
  if (typeof minDistance === 'number' && minDistance > 0) {
    const thetaMin = (minDistance * 1000) / earthRadius;
    return {
      cosThetaMin: Math.cos(thetaMin),
      chordMin: 2 * Math.sin(thetaMin / 2),
    };
  } else {
    return {};
  }
};

const allPairsTooClose = (A: Node, B: Node, chordMin?: number): boolean => {
  if (chordMin === undefined) {
    return false;
  } else {
    const centerDist = norm(subVec3(A.c, B.c));
    return centerDist + A.R + B.R < chordMin;
  }
};

interface State {
  bestScore: number;
  bestI: number;
  bestJ: number;
}

export default class PairwiseComputer<P = GeoJsonProperties> {
  constructor(
    s1: FeatureCollection<Point, P>,
    s2?: FeatureCollection<Point, P>
  ) {
    this.s1 = s1;
    this.s2 = s2 ?? s1;
    const S1 = s1.features.map((f) => pointToVec3(f.geometry.coordinates));
    const S2 = s2?.features?.map((f) => pointToVec3(f.geometry.coordinates));
    this.S1 = S1;
    this.S2 = S2 ?? S1;
    this.root1 = buildBallTree(S1, Array.from(Array(S1.length).keys()));
    this.root2 = S2
      ? buildBallTree(S2, Array.from(Array(S2.length).keys()))
      : this.root1;
  }

  private evalLeafPair = (
    A: Node,
    B: Node,
    T: Vec3,
    { bestScore, bestI, bestJ }: State,
    cosThetaMin?: number
  ): State => {
    for (const i of A.idx) {
      for (const j of B.idx) {
        const s = addVec3(this.S1[i], this.S2[j]);
        const sn = norm(s);
        if (sn < 1e-12) {
          continue;
        }
        const score = dot(T, s) / sn;
        if (
          score > bestScore &&
          (cosThetaMin === undefined ||
            dot(this.S1[i], this.S2[j]) <= cosThetaMin)
        ) {
          bestScore = score;
          bestI = i;
          bestJ = j;
        }
      }
    }
    return { bestScore, bestI, bestJ };
  };

  bestMidpointPair = (
    t: Vec3 | Point | Feature<Point, any>,
    minDistance?: number
  ): [Feature<Point, P>, Feature<Point, P>] => {
    const T: Vec3 = 'type' in t ? pointToVec3(t) : t;

    const { cosThetaMin, chordMin } = computeMinParams(minDistance);

    let leaf1 = this.root1;
    while (!leaf1.isLeaf) {
      leaf1 = leaf1.left!;
    }
    let leaf2 = this.root2;
    while (!leaf2.isLeaf) {
      leaf2 = leaf2.left!;
    }

    let state = this.evalLeafPair(
      leaf1,
      leaf2,
      T,
      {
        bestScore: -1.0,
        bestI: -1,
        bestJ: -1,
      },
      cosThetaMin
    );

    const pq = new Heap<PairItem>((a, b) => b.ub - a.ub);
    let ub0 = upperBound(this.root1, this.root2, T);
    pq.push({ A: this.root1, B: this.root2, ub: ub0 });

    while (pq.size > 0) {
      const { A, B, ub } = pq.pop()!;

      if (ub <= state.bestScore) {
        continue;
      }

      if (allPairsTooClose(A, B, chordMin)) {
        continue;
      }

      if (A.isLeaf && B.isLeaf) {
        state = this.evalLeafPair(A, B, T, state, cosThetaMin);
        continue;
      }

      let splitA: boolean;
      if (B.isLeaf) {
        splitA = true;
      } else if (A.isLeaf) {
        splitA = false;
      } else if (A.R > B.R) {
        splitA = true;
      } else if (A.R < B.R) {
        splitA = false;
      } else {
        splitA = A.idx.length >= B.idx.length;
      }

      if (splitA) {
        const A1 = A.left!;
        const A2 = A.right!;
        const ub1 = upperBound(A1, B, T);
        const ub2 = upperBound(A2, B, T);
        if (ub1 > state.bestScore) {
          pq.push({ A: A1, B, ub: ub1 });
        }
        if (ub2 > state.bestScore) {
          pq.push({ A: A2, B, ub: ub2 });
        }
      } else {
        const B1 = B.left!;
        const B2 = B.right!;
        const ub1 = upperBound(A, B1, T);
        const ub2 = upperBound(A, B2, T);
        if (ub1 > state.bestScore) {
          pq.push({ A, B: B1, ub: ub1 });
        }
        if (ub2 > state.bestScore) {
          pq.push({ A, B: B2, ub: ub2 });
        }
      }
    }

    return [this.s1.features[state.bestI], this.s2.features[state.bestJ]];
  };

  private readonly s1: FeatureCollection<Point, P>;
  private readonly s2: FeatureCollection<Point, P>;
  private readonly S1: readonly Vec3[];
  private readonly S2: readonly Vec3[];
  private readonly root1: Node;
  private readonly root2: Node;
}
