import {
  Matrix4
} from '/js/libs/three/three.module.js';

import { SelectionPoints } from '/js/modules/3d/selection/selection-points.js';
import { SelectionRaycaster } from '/js/modules/3d/selection/selection-raycaster.js';


/*
* Constants
*/

const MSG_INIT_PC = 0;
const MSG_RAYCAST = 1;

/*
* Attributes
*/

let pointsCloud = null;
let raycaster = null;
let tmpMatrix = null;


/**
 * Initialization
 */
raycaster = new SelectionRaycaster();
raycaster.near = 0.01;
raycaster.far = 500;
raycaster.params = {Points: {thresholdAngle: Math.PI/36}};

tmpMatrix = new Matrix4();


/*
 * Processing 
 */
export function processMessage(e) {
  try {
    const msgType = e.data[0];

    switch (msgType) {
      case MSG_INIT_PC:
        const pc = e.data[1];
        initializePointsCloud(pc);
        return null;
      case MSG_RAYCAST:
        const mw = e.data[1];
        const delta = e.data[2];
        const result = processRaycasting(mw, delta);
        return result;
      default:
        return null;
    }
  } catch (e) {
    return null;
  }
}


function initializePointsCloud(data) {
  const positions = new Float32Array(data);
  pointsCloud = new SelectionPoints(positions);
}


function processRaycasting(a, delta) {
  let matrixWorld = new Matrix4();
  matrixWorld.fromArray(a, 0);
  
  tmpMatrix.identity().extractRotation(matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tmpMatrix);

  const intersectedObjects = raycaster.intersectObject(pointsCloud);
  if (intersectedObjects.length) {
    return [
      intersectedObjects[0].index,
      delta,
      intersectedObjects[0].distance
    ];
  } else {
    return [-1, delta];
  }
}

export default processMessage;
