import * as geodesic from 'geographiclib-geodesic';

// https://github.com/geographiclib/geographiclib-java/blob/main/src/main/java/net/sf/geographiclib/Gnomonic.java

const eps_: number = 0.01 * Math.sqrt(geodesic.Math.epsilon);
const numit_ = 10;

export interface GnomonicData {
  lat0: number;
  lon0: number;
  lat: number;
  lon: number;
  x: number;
  y: number;
  azi: number;
  rk: number;
}

const gnomonicData = (
  lat0: number,
  lon0: number,
  lat: number,
  lon: number,
  x: number,
  y: number,
  azi: number,
  rk: number
): GnomonicData => ({
  lat0,
  lon0,
  lat,
  lon,
  x,
  y,
  azi,
  rk,
});

class Gnomonic {
  constructor(earth: geodesic.GeodesicClass) {
    this.earth = earth;
    // @ts-ignore
    this._a = earth.a;
    // @ts-ignore
    this._f = earth.f;
  }

  Forward(lat0: number, lon0: number, lat: number, lon: number): GnomonicData {
    const inv = this.earth.Inverse(
      lat0,
      lon0,
      lat,
      lon,
      geodesic.Geodesic.AZIMUTH |
        geodesic.Geodesic.GEODESICSCALE |
        geodesic.Geodesic.REDUCEDLENGTH
    );
    const fwd = gnomonicData(
      lat0,
      lon0,
      lat,
      lon,
      NaN,
      NaN,
      inv.azi2!,
      inv.M12!
    );

    if (inv.M12! > 0) {
      const rho = inv.m12! / inv.M12!;
      const p: { s: number; c: number } = geodesic.Math.sincosd(inv.azi1!);
      fwd.x = rho * p.s;
      fwd.y = rho * p.c;
    }

    return fwd;
  }

  Reverse(lat0: number, lon0: number, x: number, y: number): GnomonicData {
    const rev = gnomonicData(lat0, lon0, NaN, NaN, x, y, NaN, NaN);

    const azi0: number = geodesic.Math.atan2d(x, y);
    let rho = Math.hypot(x, y);
    let s = this._a * Math.atan(rho / this._a);

    const little = rho <= this._a;

    if (!little) {
      rho = 1 / rho;
    }

    // @ts-ignore
    const line = this.earth.Line(
      lat0,
      lon0,
      azi0,
      geodesic.Geodesic.LATITUDE |
        geodesic.Geodesic.LONGITUDE |
        geodesic.Geodesic.AZIMUTH |
        geodesic.Geodesic.DISTANCE_IN |
        geodesic.Geodesic.REDUCEDLENGTH |
        geodesic.Geodesic.GEODESICSCALE
    );

    let count = numit_;
    let trip = 0;
    let pos;

    while (count-- > 0) {
      pos = line.Position(
        s,
        geodesic.Geodesic.LONGITUDE |
          geodesic.Geodesic.LATITUDE |
          geodesic.Geodesic.AZIMUTH |
          geodesic.Geodesic.DISTANCE_IN |
          geodesic.Geodesic.REDUCEDLENGTH |
          geodesic.Geodesic.GEODESICSCALE
      );

      if (trip > 0) {
        break;
      }

      const ds = little
        ? (pos.m12 / pos.M12 - rho) * pos.M12 * pos.M12
        : (rho - pos.M12 / pos.m12) * pos.m12 * pos.m12;
      s -= ds;

      if (Math.abs(ds) <= eps_ * this._a) {
        trip++;
      }
    }

    if (trip === 0) {
      return rev;
    }

    rev.lat = pos.lat2;
    rev.lon = pos.lon2;
    rev.azi = pos.azi2;
    rev.rk = pos.M12;

    return rev;
  }

  public readonly earth: geodesic.GeodesicClass;
  private readonly _a: number;
  private readonly _f: number;
}

export default Gnomonic;
