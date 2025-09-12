import * as data from './data-constants.js';


class PointsCloudData {

  /*
   * Constants
   */

  static INFINITY_DIST = Number.POSITIVE_INFINITY;

  /*
   * Attributes
   */
 
  dataPoints = [];
 
  seriesNames = [];

  seriesT = null;

  minH = Number.POSITIVE_INFINITY;
  minT = Number.POSITIVE_INFINITY;
  maxH = Number.NEGATIVE_INFINITY;
  maxT = Number.NEGATIVE_INFINITY;
  
  minX = Number.POSITIVE_INFINITY; 
  minY = Number.POSITIVE_INFINITY; 
  minZ = Number.POSITIVE_INFINITY;
  
  maxX = Number.NEGATIVE_INFINITY; 
  maxY = Number.NEGATIVE_INFINITY; 
  maxZ = Number.NEGATIVE_INFINITY;

  filterMinH = 1;
  filterMaxH = Number.POSITIVE_INFINITY;
  filterMinX = Number.NEGATIVE_INFINITY;
  filterMaxX = Number.POSITIVE_INFINITY;
  filterMinY = Number.NEGATIVE_INFINITY;
  filterMaxY = Number.POSITIVE_INFINITY;
  filterMinZ = Number.NEGATIVE_INFINITY;
  filterMaxZ = Number.POSITIVE_INFINITY;

  scaleX = null;
  scaleY = null;
  scaleZ = null;


  /*
   * Constructor
   */
  constructor(
    seriesXName, seriesYName, seriesZName,
    seriesH, seriesT,
    seriesX, seriesY, seriesZ,
    scaleX=data.SCALE_LIN, 
    scaleY=data.SCALE_LIN, 
    scaleZ=data.SCALE_LIN,
    filterMinH=1,
    filterMaxH=Number.POSITIVE_INFINITY,
    filterMinX=Number.NEGATIVE_INFINITY,
    filterMaxX=Number.POSITIVE_INFINITY,
    filterMinY=Number.NEGATIVE_INFINITY,
    filterMaxY=Number.POSITIVE_INFINITY,
    filterMinZ=Number.NEGATIVE_INFINITY,
    filterMaxZ=Number.POSITIVE_INFINITY,
  ) {

    this.seriesNames = [
      seriesXName,
      seriesYName,
      seriesZName
    ];

    this.seriesT = seriesT;

    this.filterMinH = filterMinH;
    this.filterMaxH = filterMaxH;
    this.filterMinX = filterMinX;
    this.filterMaxX = filterMaxX;
    this.filterMinY = filterMinY;
    this.filterMaxY = filterMaxY;
    this.filterMinZ = filterMinZ;
    this.filterMaxZ = filterMaxZ;

    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.scaleZ = scaleZ;

    const seriesLen = seriesH.length;

    for (let i = 0; i < seriesLen; i++) {
      const h = seriesH[i];
      // Gets the values for the selected series
      let t = seriesT ? seriesT[i] : 0;
      let x = seriesX ? seriesX[i] : 0;
      let y = seriesY ? seriesY[i] : 0;
      let z = seriesZ ? seriesZ[i] : 0;
      // Processes log scale if needed
      if (scaleX == data.SCALE_LOG) { x = Math.log10(x); }
      if (scaleY == data.SCALE_LOG) { y = Math.log10(y); }
      if (scaleZ == data.SCALE_LOG) { z = Math.log10(z); }
      // Filters blocks
      const isInHRange = h >=this.filterMinH && h <= this.filterMaxH;
      const isInXRange = x >=this.filterMinX && x <= this.filterMaxX && x != Number.NEGATIVE_INFINITY;
      const isInYRange = y >=this.filterMinY && y <= this.filterMaxY && y != Number.NEGATIVE_INFINITY;
      const isInZRange = z >=this.filterMinZ && z <= this.filterMaxZ && z != Number.NEGATIVE_INFINITY;
      if (isInHRange && isInXRange && isInYRange && isInZRange) {
        // Block must be displayed
        // Refreshes min & max values for all dimensions
        if (x < this.minX) { this.minX = x; }
        if (y < this.minY) { this.minY = y; }
        if (z < this.minZ) { this.minZ = z; }
        if (x > this.maxX) { this.maxX = x; }
        if (y > this.maxY) { this.maxY = y; }
        if (z > this.maxZ) { this.maxZ = z; }
        // Refreshes min & max values for block height and timestamp
        if (h > this.maxH) { this.maxH = h; }
        if (h < this.minH) { this.minH = h; }
        if (t > this.maxT) { this.maxT = t; }
        if (t < this.minT) { this.minT = t; }
        // Adds the new point
        this.dataPoints.push({'key': h, 'ts': t, 'x': x, 'y': y, 'z': z});
      } 
    }
  }

}

export { PointsCloudData };
