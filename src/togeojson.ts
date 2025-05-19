// https://github.com/mapbox/togeojson/blob/master/togeojson.js
/* @license
 * Copyright (c) 2016 Mapbox All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  LineString,
  MultiLineString,
  Point,
  Position,
} from 'geojson';

const removeSpace = /\s*/g,
  trimSpace = /^\s*|\s*$/g,
  splitSpace = /\s+/;
// generate a short, numeric hash of a string
function okhash(x: string): number {
  if (!x || !x.length) return 0;
  let h = 0;
  for (let i = 0; i < x.length; i++) {
    h = ((h << 5) - h + x.charCodeAt(i)) | 0;
  }
  return h;
}
// all Y children of X
function get(x: Element | Document, y: string) {
  return x.getElementsByTagName(y);
}
function attr(x: Element, y: string): string | null {
  return x.getAttribute(y);
}
function attrf(x: Element, y: string) {
  return parseFloat(attr(x, y) ?? '0.0');
}
// one Y child of X, if any, otherwise null
function get1(x: Element, y: string): Element | null {
  const n = get(x, y);
  return n.length ? n[0] : null;
}
// https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
function norm(el: Node) {
  if (el.normalize) {
    el.normalize();
  }
  return el;
}
// cast array x into numbers
function numarray(x: any[]): number[] {
  let o: number[] = [];
  for (let j = 0; j < x.length; j++) {
    o[j] = parseFloat(x[j]);
  }
  return o;
}
// get the content of a text node, if any
function nodeVal(x: Node | null): string {
  if (x) {
    norm(x);
  }
  return x?.textContent ?? '';
}
// get the contents of multiple text nodes, if present
function getMulti<T extends string>(
  x: Element,
  ys: T[]
): Partial<Record<T, string>> {
  const o: Partial<Record<T, string>> = {};
  for (let k = 0; k < ys.length; k++) {
    const n = get1(x, ys[k]);
    if (n) {
      o[ys[k]] = nodeVal(n);
    }
  }
  return o;
}
// get one coordinate from a coordinate array, if any
function coord1(v: string): Position {
  return numarray(v.replace(removeSpace, '').split(','));
}
// get all coordinates from a coordinate array as [[],[]]
function coord(v: string): Position[] {
  const coords = v.replace(trimSpace, '').split(splitSpace);
  return coords.map((coord) => coord1(coord));
}

interface CoordPair {
  coordinates: Position;
  time: string | null;
  heartRate: number | null;
}

function coordPair(x: Element): CoordPair {
  const ll = [attrf(x, 'lon'), attrf(x, 'lat')],
    ele = get1(x, 'ele'),
    // handle namespaced attribute in browser
    heartRate = get1(x, 'gpxtpx:hr') || get1(x, 'hr'),
    time = get1(x, 'time');
  if (ele) {
    const e = parseFloat(nodeVal(ele));
    if (!isNaN(e)) {
      ll.push(e);
    }
  }
  return {
    coordinates: ll,
    time: time ? nodeVal(time) : null,
    heartRate: heartRate ? parseFloat(nodeVal(heartRate)) : null,
  };
}

// create a new feature collection parent object
function fc<G extends Geometry>(): FeatureCollection<G> {
  return {
    type: 'FeatureCollection',
    features: [],
  };
}

const serializer = new XMLSerializer();
function xml2str(str: Node): string {
  return serializer.serializeToString(str);
}

export function kml(doc: XMLDocument): FeatureCollection {
  const gj = fc();
  // styleindex keeps track of hashed styles in order to match features
  const styleIndex: Record<string, string> = {};
  const styleByHash: Record<string, Element> = {};
  // stylemapindex keeps track of style maps to expose in properties
  const styleMapIndex: Record<string, Record<string, string>> = {};
  // atomic geospatial types supported by KML - MultiGeometry is
  // handled separately
  const geotypes = ['Polygon', 'LineString', 'Point', 'Track', 'gx:Track'];
  // all root placemarks in the file
  const placemarks = get(doc, 'Placemark');
  const styles = get(doc, 'Style');
  const styleMaps = get(doc, 'StyleMap');

  for (let k = 0; k < styles.length; k++) {
    const hash = okhash(xml2str(styles[k])).toString(16);
    styleIndex['#' + attr(styles[k], 'id')] = hash;
    styleByHash[hash] = styles[k];
  }
  for (let l = 0; l < styleMaps.length; l++) {
    styleIndex['#' + attr(styleMaps[l], 'id')] = okhash(
      xml2str(styleMaps[l])
    ).toString(16);
    const pairs = get(styleMaps[l], 'Pair');
    const pairsMap: Record<string, string> = {};
    for (let m = 0; m < pairs.length; m++) {
      pairsMap[nodeVal(get1(pairs[m], 'key'))] = nodeVal(
        get1(pairs[m], 'styleUrl')
      );
    }
    styleMapIndex['#' + attr(styleMaps[l], 'id')] = pairsMap;
  }
  for (let j = 0; j < placemarks.length; j++) {
    gj.features.push(...getPlacemark(placemarks[j]));
  }
  function kmlColor(v: string = ''): [string, number | undefined] {
    let color: string = '';
    let opacity: number | undefined;
    if (v.substring(0, 1) === '#') {
      v = v.substring(1);
    }
    if (v.length === 6 || v.length === 3) {
      color = v;
    }
    if (v.length === 8) {
      opacity = parseInt(v.substring(0, 2), 16) / 255;
      color = '#' + v.substring(6, 8) + v.substring(4, 6) + v.substring(2, 4);
    }
    return [
      color,
      typeof opacity !== 'number' || isNaN(opacity) ? undefined : opacity,
    ];
  }
  function gxCoord(v: string): Position {
    return numarray(v.split(' '));
  }
  function gxCoords(root: Element): { coords: Position[]; times: string[] } {
    let elems = get(root, 'coord');
    const coords: Position[] = [];
    const times: string[] = [];
    if (elems.length === 0) elems = get(root, 'gx:coord');
    for (let i = 0; i < elems.length; i++)
      coords.push(gxCoord(nodeVal(elems[i])));
    const timeElems = get(root, 'when');
    for (let j = 0; j < timeElems.length; j++)
      times.push(nodeVal(timeElems[j]));
    return { coords, times };
  }
  function getGeometry(root: Element): {
    geoms: Geometry[];
    coordTimes: string[][];
  } {
    let geoms: Geometry[] = [];
    let coordTimes: string[][] = [];
    let mg = get1(root, 'MultiGeometry');
    if (mg) {
      return getGeometry(mg);
    }
    mg = get1(root, 'MultiTrack');
    if (mg) {
      return getGeometry(mg);
    }
    mg = get1(root, 'gx:MultiTrack');
    if (mg) {
      return getGeometry(mg);
    }
    for (let i = 0; i < geotypes.length; i++) {
      const geomNodes = get(root, geotypes[i]);
      if (geomNodes) {
        for (let j = 0; j < geomNodes.length; j++) {
          const geomNode = geomNodes[j];
          if (geotypes[i] === 'Point') {
            geoms.push({
              type: 'Point',
              coordinates: coord1(nodeVal(get1(geomNode, 'coordinates'))),
            });
          } else if (geotypes[i] === 'LineString') {
            geoms.push({
              type: 'LineString',
              coordinates: coord(nodeVal(get1(geomNode, 'coordinates'))),
            });
          } else if (geotypes[i] === 'Polygon') {
            const rings = get(geomNode, 'LinearRing');
            const coordinates: Position[][] = [];
            for (let k = 0; k < rings.length; k++) {
              coordinates.push(coord(nodeVal(get1(rings[k], 'coordinates'))));
            }
            geoms.push({
              type: 'Polygon',
              coordinates,
            });
          } else if (geotypes[i] === 'Track' || geotypes[i] === 'gx:Track') {
            const track = gxCoords(geomNode);
            geoms.push({
              type: 'LineString',
              coordinates: track.coords,
            });
            if (track.times.length) {
              coordTimes.push(track.times);
            }
          }
        }
      }
    }
    return { geoms, coordTimes };
  }
  function getPlacemark(root: Element): Feature[] {
    const geomsAndTimes = getGeometry(root);
    const properties: GeoJsonProperties = {};
    const name = nodeVal(get1(root, 'name'));
    const address = nodeVal(get1(root, 'address'));
    let styleUrl = nodeVal(get1(root, 'styleUrl'));
    const description = nodeVal(get1(root, 'description'));
    const timeSpan = get1(root, 'TimeSpan');
    const timeStamp = get1(root, 'TimeStamp');
    const extendedData = get1(root, 'ExtendedData');
    let lineStyle = get1(root, 'LineStyle');
    let polyStyle = get1(root, 'PolyStyle');
    const visibility = get1(root, 'visibility');

    if (!geomsAndTimes.geoms.length) return [];
    if (name) properties.name = name;
    if (address) properties.address = address;
    if (styleUrl) {
      if (styleUrl[0] !== '#') {
        styleUrl = '#' + styleUrl;
      }

      properties.styleUrl = styleUrl;
      if (styleIndex[styleUrl]) {
        properties.styleHash = styleIndex[styleUrl];
      }
      if (styleMapIndex[styleUrl]) {
        properties.styleMapHash = styleMapIndex[styleUrl];
        properties.styleHash = styleIndex[styleMapIndex[styleUrl].normal];
      }
      // Try to populate the lineStyle or polyStyle since we got the style hash
      const style = styleByHash[properties.styleHash];
      if (style) {
        if (!lineStyle) lineStyle = get1(style, 'LineStyle');
        if (!polyStyle) polyStyle = get1(style, 'PolyStyle');
      }
    }
    if (description) properties.description = description;
    if (timeSpan) {
      const begin = nodeVal(get1(timeSpan, 'begin'));
      const end = nodeVal(get1(timeSpan, 'end'));
      properties.timespan = { begin, end };
    }
    if (timeStamp) {
      properties.timestamp = nodeVal(get1(timeStamp, 'when'));
    }
    if (lineStyle) {
      const [color, opacity] = kmlColor(nodeVal(get1(lineStyle, 'color')));
      const width = parseFloat(nodeVal(get1(lineStyle, 'width')));
      if (color) {
        properties.stroke = color;
      }
      if (typeof opacity === 'number' && !isNaN(opacity)) {
        properties['stroke-opacity'] = opacity;
      }
      if (!isNaN(width)) {
        properties['stroke-width'] = width;
      }
    }
    if (polyStyle) {
      const [pcolor, popacity] = kmlColor(nodeVal(get1(polyStyle, 'color')));
      const fill = nodeVal(get1(polyStyle, 'fill'));
      const outline = nodeVal(get1(polyStyle, 'outline'));
      if (pcolor) {
        properties.fill = pcolor;
      }
      if (typeof popacity === 'number' && !isNaN(popacity)) {
        properties['fill-opacity'] = popacity;
      }
      if (fill) {
        properties['fill-opacity'] =
          fill === '1' ? properties['fill-opacity'] || 1 : 0;
      }
      if (outline) {
        properties['stroke-opacity'] =
          outline === '1' ? properties['stroke-opacity'] || 1 : 0;
      }
    }
    if (extendedData) {
      const datas = get(extendedData, 'Data');
      const simpleDatas = get(extendedData, 'SimpleData');

      for (let i = 0; i < datas.length; i++) {
        properties[datas[i].getAttribute('name')!] = nodeVal(
          get1(datas[i], 'value')
        );
      }
      for (let i = 0; i < simpleDatas.length; i++) {
        properties[simpleDatas[i].getAttribute('name')!] = nodeVal(
          simpleDatas[i]
        );
      }
    }
    if (visibility) {
      properties.visibility = nodeVal(visibility);
    }
    if (geomsAndTimes.coordTimes.length) {
      properties.coordTimes =
        geomsAndTimes.coordTimes.length === 1
          ? geomsAndTimes.coordTimes[0]
          : geomsAndTimes.coordTimes;
    }
    const feature: Feature = {
      type: 'Feature',
      geometry:
        geomsAndTimes.geoms.length === 1
          ? geomsAndTimes.geoms[0]
          : {
              type: 'GeometryCollection',
              geometries: geomsAndTimes.geoms,
            },
      properties: properties,
    };
    const id = attr(root, 'id');
    if (id) {
      feature.id = id;
    }
    return [feature];
  }
  return gj;
}

interface JsonLink {
  href: string | null;
  text?: string;
  type?: string;
}

export function gpx(doc: XMLDocument): FeatureCollection {
  const tracks = get(doc, 'trk');
  const routes = get(doc, 'rte');
  const waypoints = get(doc, 'wpt');
  // a feature collection
  const gj = fc();
  for (let i = 0; i < tracks.length; i++) {
    const feature = getTrack(tracks[i]);
    if (feature) {
      gj.features.push(feature);
    }
  }
  for (let i = 0; i < routes.length; i++) {
    const feature = getRoute(routes[i]);
    if (feature) {
      gj.features.push(feature);
    }
  }
  for (let i = 0; i < waypoints.length; i++) {
    gj.features.push(getPoint(waypoints[i]));
  }
  function getPoints(
    node: Element,
    pointname: string
  ): null | { line: Position[]; times?: string[]; heartRates?: number[] } {
    const pts = get(node, pointname);
    const line: Position[] = [];
    const times: string[] = [];
    const heartRates: number[] = [];
    const l = pts.length;
    if (l < 2) {
      // Invalid line in GeoJSON
      return null;
    }
    for (let i = 0; i < l; i++) {
      const c = coordPair(pts[i]);
      line.push(c.coordinates);
      if (c.time) times.push(c.time);
      if (c.heartRate) heartRates.push(c.heartRate);
    }
    return {
      line,
      times,
      heartRates,
    };
  }
  function getTrack(
    node: Element
  ): Feature<LineString | MultiLineString> | undefined {
    const segments = get(node, 'trkseg');
    const track: Position[][] = [];
    const times: string[][] = [];
    const heartRates: number[][] = [];
    for (let i = 0; i < segments.length; i++) {
      const line = getPoints(segments[i], 'trkpt');
      if (line) {
        if (line.line) track.push(line.line);
        if (line.times?.length) times.push(line.times);
        if (line.heartRates?.length) heartRates.push(line.heartRates);
      }
    }
    if (track.length === 0) {
      return;
    }
    const properties: GeoJsonProperties = getProperties(node);
    Object.assign(properties, getLineStyle(get1(node, 'extensions')));
    if (times.length)
      properties.coordTimes = track.length === 1 ? times[0] : times;
    if (heartRates.length)
      properties.heartRates = track.length === 1 ? heartRates[0] : heartRates;
    const geometry: LineString | MultiLineString =
      track.length === 1
        ? { type: 'LineString', coordinates: track[0] }
        : { type: 'MultiLineString', coordinates: track };
    return {
      type: 'Feature',
      properties,
      geometry,
    };
  }
  function getRoute(node: Element): Feature<LineString> | undefined {
    const line = getPoints(node, 'rtept');
    if (!line) {
      return;
    }
    const properties: NonNullable<GeoJsonProperties> = getProperties(node);
    Object.assign(properties, getLineStyle(get1(node, 'extensions')));
    return {
      type: 'Feature',
      properties,
      geometry: {
        type: 'LineString',
        coordinates: line.line,
      },
    };
  }
  function getPoint(node: Element): Feature<Point> {
    const prop = getProperties(node);
    Object.assign(prop, getMulti(node, ['sym']));
    return {
      type: 'Feature',
      properties: prop,
      geometry: {
        type: 'Point',
        coordinates: coordPair(node).coordinates,
      },
    };
  }
  function getLineStyle(extensions: Element | null): GeoJsonProperties {
    const style: Record<string, any> = {};
    if (extensions) {
      const lineStyle = get1(extensions, 'line');
      if (lineStyle) {
        const color = nodeVal(get1(lineStyle, 'color'));
        const opacity = parseFloat(nodeVal(get1(lineStyle, 'opacity')));
        const width = parseFloat(nodeVal(get1(lineStyle, 'width')));
        if (color) style.stroke = color;
        if (!isNaN(opacity)) style['stroke-opacity'] = opacity;
        // GPX width is in mm, convert to px with 96 px per inch
        if (!isNaN(width)) style['stroke-width'] = (width * 96) / 25.4;
      }
    }
    return style;
  }
  function getProperties(node: Element): NonNullable<GeoJsonProperties> {
    const prop: Record<string, any> = getMulti(node, [
      'name',
      'cmt',
      'desc',
      'type',
      'time',
      'keywords',
    ]);
    const links = get(node, 'link');
    if (links.length) {
      const jsonLinks: JsonLink[] = [];
      for (let i = 0; i < links.length; i++) {
        const link: JsonLink = { href: attr(links[i], 'href') };
        Object.assign(link, getMulti(links[i], ['text', 'type']));
        jsonLinks.push(link);
      }
      prop.links = jsonLinks;
    }
    return prop;
  }
  return gj;
}
