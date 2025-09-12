import {
  Group,
  PerspectiveCamera,
} from 'three';

import { POS_FAR_AWAY } from '../data/positions-constants.js';


class Camera extends PerspectiveCamera {
  
  // Camera attributes
  static VIEW_ANGLE = 95;
  static ASPECT = window.innerWidth / window.innerHeight;
  static NEAR = 0.01;
  static FAR = 1000000;

  /*
   * Attributes
   */

  world3d = null;

  // Parent
  parent = null;

  // Camera used in VR mode
  vrCamera = null;


  /*
   * Constructor
   */
  constructor(world3d) {
    super(Camera.VIEW_ANGLE, Camera.ASPECT, Camera.NEAR, Camera.FAR);

    this.world3d = world3d;

    this.parent = new Group();
    this.parent.rotation.x = 0;
    this.parent.rotation.y = 0;
    this.parent.rotation.z = 0;
    this.rotation.x = 0;
    this.rotation.y = 0;
    this.rotation.z = 0;
    this.parent.add(this);

    

    // this.parent.rotateY(Math.PI);
    
    this.moveTo(POS_FAR_AWAY[0], POS_FAR_AWAY[1]);
    this.refreshProjectionMatrix();

    window.addEventListener(
      'resize', 
      this.refreshProjectionMatrix.bind(this), 
      false
    );
  }

  /*
   * Set camera's position and rotation
   */
  moveTo(pos, rot) {
    this.parent.position.x = pos[0];
    this.parent.position.y = pos[1];
    this.parent.position.z = pos[2];
    this.parent.rotation.x = rot[0];
    this.parent.rotation.y = rot[1];
    this.parent.rotation.z = rot[2];
    this.parent.updateMatrixWorld(true);
  }

  /*
   * Refresh the projection matrix
   */
  refreshProjectionMatrix() {
    this.aspect = window.innerWidth / window.innerHeight;
    this.updateProjectionMatrix();
  }

  /*
   * Dispose the camera 
   */
  dispose() {
    // Removes the event listeners
    window.removeEventListener(
      'resize', 
      this.refreshProjectionMatrix.bind(this)
    );
    // Resets the references to others objects
    this.world3d = null;
    this.parent = null;
  }

}

export { Camera };
