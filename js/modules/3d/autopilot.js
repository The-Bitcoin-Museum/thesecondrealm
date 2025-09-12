import '/js/libs/tweenjs/tween.umd.js';

import { 
  Euler,
  Vector3,
  CatmullRomCurve3
} from 'three';


class Autopilot {

  /*
   * Constants
   */

  static COORD_HEIGHT = 'block_height';
  static COORD_DATA= 'data_series';

  static DEFAULT_SPEED = 1500;


  /* 
   * Attributes
   */

  world3d = null;

  version = null;
  title = null;
  coordTypes = null;
  stages = [];
  curve = null;

  duration = 0;
  approximateDistance = 0;
  enabled = false;
  cumulatedDuration = 0;

  isLoadingOk = false;
  
  

  /*
   * Constructor 
   */
  constructor(world3d) {
    this.world3d = world3d;
  }

  /*
   * Load the descriptor file 
   */
  async load(url) {
    this.isLoadingOk = false;

    const tourDescriptor = await dataStore.getTourDescriptorFile(url);
    if (!tourDescriptor) {
      return; 
    }
    
    this.title = tourDescriptor['title'];
    this.version = tourDescriptor['version'];
    this.coordTypes = tourDescriptor['coords_type'];
    
    let initPos = new Vector3();
    this.world3d.camera.parent.getWorldPosition(initPos);
    this.stages.push(initPos);

    let prevPos = initPos.clone();

    for (let stage of tourDescriptor['stages']) {
      const pos = this.getWorld3dPosition(stage['coords']);
      if (pos == null) return;
      const newPos = new Vector3(pos[0], pos[1], pos[2]);
      this.stages.push(newPos);
      this.approximateDistance += newPos.distanceTo(prevPos);
      prevPos = newPos.clone();
    }

    this.curve = new CatmullRomCurve3(this.stages, false, 'chordal', 1);
    this.duration = this.approximateDistance / Autopilot.DEFAULT_SPEED;

    // Rotates the camera towards the trajectory
    // and starts the trip when this rotation is over.
    // const startPos = this.stages[0];
    // const targetPos = this.curve.getPoint(0.025 / this.duration);
    // const antiTargetPoS = new Vector3(
    //   2 * startPos.x - targetPos.x,
    //   2 * startPos.y - targetPos.y,
    //   2 * startPos.z - targetPos.z
    // );
    // this.world3d.camera.parent.lookAt(antiTargetPoS);

    this.isLoadingOk = true;
  }

  /**
   * Converts a position expressed in block height 
   * or in data series coordinates
   * into World3D coordinates
   */
  getWorld3dPosition(pos) {
    if (this.coordTypes == Autopilot.COORD_DATA) {
      return this.world3d.pointsCloud.rawDataToCoords3d(pos);
    } else {
      return this.world3d.pointsCloud.heightToCoords3d(pos);
    }
  } 

  /*
   * Start the trip
   */
  start() {
    if (!this.isLoadingOk) return;

    this.displayIntroductoryMessage();

    setTimeout(() => {
      // Clears the hud
      this.world3d.hud.leftScreen.displayMessage('', '', '');
      // Starts the trip
      this.enabled = true;
    }, 10000); 
  } 

  /*
   * Display an introductory message 
   */
  displayIntroductoryMessage() {
    const title = `Welcome to our autopiloted trip\n"${this.title}"`;
    const content1 = `Fasten your seat belt. This trip will begin in 10 seconds.\n\n We hope that you'll enjoy the ride.`;
    const content2 = ``;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Dispose 
   */
  dispose() {
    // Resets the references to others objects
    this.world3d = null;
    this.curve = null;

  }

  /*
   * Code processed in the update loop 
   */
  update(delta) {
    if (!this.isLoadingOk) return;

    if (this.enabled) {
      this.cumulatedDuration += delta;
      const index = this.cumulatedDuration / this.duration;
      if (index >= 1) {
        this.enabled = false;
        return;
      }
      const camPos = this.curve.getPoint(index);
      this.world3d.camera.parent.position.x = camPos.x;
      this.world3d.camera.parent.position.y = camPos.y;
      this.world3d.camera.parent.position.z = camPos.z;
      if (this.cumulatedDuration - delta > 0) {
        const indexLookAt = (this.cumulatedDuration - delta) / this.duration;
        const lookAtPoint = this.curve.getPoint(indexLookAt);
        this.world3d.camera.parent.lookAt(lookAtPoint);
      }
    } else if (this.cumulatedDuration == 0) {
      TWEEN.update();
    }
  }

}

export { Autopilot };
