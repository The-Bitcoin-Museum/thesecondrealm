import {
  Points,
  Float32BufferAttribute,
  BufferGeometry,
  Sphere,
  Vector3,
  Matrix4,
  Ray
} from '/js/libs/three/three.module.js';


class SelectionPoints extends Points {


  /*
   * Attributes
   */
  #sphere = new Sphere();
  #inverseMatrix = new Matrix4();
  #ray = new Ray();
  #vector = new Vector3();
  #position = new Vector3();


  /*
   * Constructor 
   */
  constructor(positions) {
    let geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 4));
    super(geometry);
  }


  /*
   * Override of Points.raycast()
   */
  raycast(raycaster, intersects) {
		const geometry = this.geometry;
		const matrixWorld = this.matrixWorld;
    const thresholdAngle = raycaster.params.Points.thresholdAngle;
		const drawRange = geometry.drawRange;

		// Checking boundingSphere distance to ray
		if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

		this.#sphere.copy(geometry.boundingSphere);
		this.#sphere.applyMatrix4(matrixWorld);
		
		if (raycaster.ray.intersectsSphere(this.#sphere) === false) return;

    this.#inverseMatrix.copy(matrixWorld).invert();
		this.#ray.copy(raycaster.ray).applyMatrix4(this.#inverseMatrix);

		const thresholdCosine = Math.cos(thresholdAngle);

		const index = geometry.index;
		const attributes = geometry.attributes;
		const positionAttribute = attributes.position;

		if (index !== null) {
			const start = Math.max(0, drawRange.start);
			const end = Math.min(index.count, (drawRange.start + drawRange.count));
			for (let i = start, il = end; i < il; i++) {
				const a = index.getX(i);
				this.#position.fromBufferAttribute(positionAttribute, a);
				this.#testPoint(this.#position, a, thresholdCosine, raycaster, intersects, this);
			}
		} else {
			const start = Math.max(0, drawRange.start);
			const end = Math.min(positionAttribute.count, (drawRange.start + drawRange.count));
			for (let i=start, l=end; i < l; i++) {
				this.#position.fromBufferAttribute(positionAttribute, i);
				this.#testPoint(this.#position, i, thresholdCosine, raycaster, intersects, this);
			}
		}
	}

  /**
   * Override of testPoint()
   */
  #testPoint(point, index, thresholdCosine, raycaster, intersects, object) {
    // Check if point is behind the ray
    const dotProduct = this.#vector.subVectors(point, this.#ray.origin).dot(this.#ray.direction);
    if (dotProduct < 0) {
      return;
    }
    const distance = raycaster.ray.origin.distanceTo(point);
    if (distance < raycaster.near || distance > raycaster.far) return;
    const rayPointDistance = this.#ray.distanceToPoint(point);
    const rayPointCosine = dotProduct / distance;
    if (rayPointCosine >= thresholdCosine) {
      intersects.push({
        distance: distance,
        point: point,
        index: index,
        face: null,
        object: object
      });
    }
  }

}

export { SelectionPoints };
