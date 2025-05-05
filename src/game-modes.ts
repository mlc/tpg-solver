import { Feature, FeatureCollection, LineString, Point } from 'geojson';

export enum GameMode {
  BASIC = 'basic',
  LINE = 'line',
  MULTI = 'multi',
  CROSS = 'cross',
}

export enum Geoid {
  SPHERE,
  WGS84,
}

interface BasicGame {
  mode: GameMode.BASIC;
  target: Feature<Point>;
  geoid: Geoid;
}

interface LineGame {
  mode: GameMode.LINE;
  target: Feature<LineString>;
  geoid: Geoid;
}

interface MultiGame {
  mode: GameMode.MULTI;
  target: FeatureCollection<Point>;
  geoid: Geoid;
}

export type GameConfig = BasicGame | LineGame | MultiGame;
