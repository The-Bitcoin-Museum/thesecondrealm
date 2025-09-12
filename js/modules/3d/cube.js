import {
  Vector3,
  Object3D,
  BufferGeometry,
  LineBasicMaterial,
  Line
} from 'three';


class Cube extends Object3D {
  
  /*
   * Attributes
   */

  constructor() {
    super();
  }

  build(size, color) {
    const material = new LineBasicMaterial({color: color});
    
    const points = [];
    points.push(new Vector3(0, 0, 0));
    points.push(new Vector3(0, size, 0));
    points.push(new Vector3(size, size, 0));
    points.push(new Vector3(size, 0, 0));
    points.push(new Vector3(0, 0, 0));
    points.push(new Vector3(0, 0, size));
    points.push(new Vector3(0, size, size));
    points.push(new Vector3(size, size, size));
    points.push(new Vector3(size, 0, size));
    points.push(new Vector3(0, 0, size));
    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, material);
    this.add(line);

    const points2 = [];
    points2.push(new Vector3(0, size, 0));
    points2.push(new Vector3(0, size, size));
    const geometry2 = new BufferGeometry().setFromPoints(points2);
    const line2 = new Line(geometry2, material);
    this.add(line2);

    const points3 = [];
    points3.push(new Vector3(size, size, 0));
    points3.push(new Vector3(size, size, size));
    const geometry3 = new BufferGeometry().setFromPoints(points3);
    const line3 = new Line(geometry3, material);
    this.add(line3);

    const points4 = [];
    points4.push(new Vector3(size, 0, 0));
    points4.push(new Vector3(size, 0, size));
    const geometry4 = new BufferGeometry().setFromPoints(points4);
    const line4 = new Line(geometry4, material);
    this.add(line4);
  }

  /*
   * Dispose the cube 
   */
  dispose() {
  }

}

export { Cube };
