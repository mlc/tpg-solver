import { Feature, FeatureCollection, LineString, Point } from 'geojson';

export enum GameMode {
  BASIC = 'basic',
  LINE = 'line',
  MULTI = 'multi',
}

interface BasicGame {
  mode: GameMode.BASIC;
  target: Feature<Point>;
}

interface LineGame {
  mode: GameMode.LINE;
  target: Feature<LineString>;
}

interface MultiGame {
  mode: GameMode.MULTI;
  target: FeatureCollection<Point>;
}

export type GameConfig = BasicGame | LineGame | MultiGame;
