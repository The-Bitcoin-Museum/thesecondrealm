import {
  Raycaster
} from '/js/libs/three/three.module.js';


class SelectionRaycaster extends Raycaster {

  constructor(origin, direction, near=0, far=Infinity) {
    super(origin, direction, near, far);
  }

  /*
   * Override of intersection methods
   * for custom sort function 
   */
  intersectObject(object, recursive=true, intersects=[]) {
		this.intersectObject(object, intersects, recursive);
		intersects.sort(this.ascSort);
		return intersects;
	}

	intersectObjects(objects, recursive=true, intersects=[]) {
		for (let i=0, l=objects.length; i < l; i++) {
			this.intersectObject(objects[i], intersects, recursive);
		}
		intersects.sort(this.ascSort);
		return intersects;
	}

  ascSort(a, b) {
    return b.cosine - a.cosine;
  }

  intersectObject(object, intersects=[], recursive=true) {
    if (object.layers.test(this.layers)) {
      object.raycast(this, intersects);  
    }
    if (recursive === true) {
      const children = object.children;
      for (let i=0, l=children.length; i < l; i++) {
        this.intersectObject(children[i], intersects, true);
      }
    }
    return intersects;
  }

}

export { SelectionRaycaster };
