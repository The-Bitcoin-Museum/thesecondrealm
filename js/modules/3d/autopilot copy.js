import '/js/libs/tweenjs/tween.umd.js'

import { 
  Vector3,
  Euler,
} from 'three';


class Autopilot {

  /*
   * Constants
   */

  static COORD_HEIGHT = 'block_height';
  static COORD_DATA= 'data_series';

  /* 
   * Attributes
   */

  world3d = null;

  version = null;
  title = null;
  coordTypes = null;
  stages = [];
  currentStage = 0;
  isLoadingOk = false;

  #refreshCumulWait = 0;
  #timer = null;


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
    
    for (let stage of tourDescriptor['stages']) {
      const pos = this.getWorld3dPosition(stage['coords']);
      if (pos == null) return;
      this.stages.push({
        'coords': pos,
        'pause': (stage['pause']) ? stage['pause'] : 0
      });
    }

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
    this.moveTo(this.stages[this.currentStage].coords, 1); 
  }

  /*
   * Move the camera to a given target position
   * (autopilot mode)
   */
  moveTo(target, delay) {
    let targetPos = new Vector3(target[0], target[1], target[2]);

    // Gets the position of the camera
    let cameraPos = new Vector3();
    this.world3d.camera.parent.getWorldPosition(cameraPos);
    
    // Computes duration of movement
    // based on a given static speed
    const distance = cameraPos.distanceTo(targetPos);
    const duration = distance * 1000 / 7500;
    
    // Builds the animation for the translation
    let fromCoords = {x: cameraPos.x, y: cameraPos.y, z: cameraPos.z};
    let toCoords = {x: targetPos.x, y: targetPos.y, z: targetPos.z};
    
    let tweenTr = new TWEEN.Tween(fromCoords)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .to(toCoords, duration)
    .onUpdate(() => {
      this.world3d.camera.parent.position.x = fromCoords.x;
      this.world3d.camera.parent.position.y = fromCoords.y;
      this.world3d.camera.parent.position.z = fromCoords.z;
    })
    .onComplete(() => {
      this.currentStage++;
      if (this.currentStage < this.stages.length) {
        this.moveTo(
          this.stages[this.currentStage].coords, 
          this.stages[this.currentStage-1].pause
        );
      }
    });

    // Prepares the animation of the rotation towards the target
    let startRotation = new Euler().copy(this.world3d.camera.parent.rotation);
    const antiTargetPoS = new Vector3(
      2 * cameraPos.x - targetPos.x,
      cameraPos.y,
      2 * cameraPos.z - targetPos.z
    ); 
    this.world3d.camera.parent.lookAt(antiTargetPoS);
    let endRotation = new Euler().copy(this.world3d.camera.parent.rotation);
    this.world3d.camera.parent.rotation.copy(startRotation);
    console.log(startRotation);
    console.log(endRotation);
    // Builds the animation for the rotation
    //let fromRot = {rx: startRotation.x, ry: startRotation.y, rz: startRotation.z};
    //let toRot = {rx: endRotation.x, ry: endRotation.y, rz: endRotation.z};
    let fromRot = {ry: startRotation.y};
    const factor = (startRotation.y * endRotation.y < 0) ? -1 : 1;
    let toRot = {ry:  factor * endRotation.y};
    
    let tweenRot = new TWEEN.Tween(fromRot).to(toRot, 4000)
    .delay(delay * 1000)
    .onUpdate(() => {
      //this.world3d.camera.parent.rotation.x = fromRot.rx;
      this.world3d.camera.parent.rotation.y = fromRot.ry;
      //this.world3d.camera.parent.rotation.z = fromRot.rz;
      console.log(fromRot);
    });

    // Chains and starts the animations
    tweenRot.chain(tweenTr);
    tweenRot.start();
  }

  /*
   * Compute the distance
   * between the camera and a target position 
   */
  getDistanceToProbe(target) {
    let cameraPos = new Vector3();
    this.world3d.camera.parent.getWorldPosition(cameraPos);
    let targetPos = new Vector3(target[0], target[1], target[2]);
    return cameraPos.distanceTo(targetPos);
  }

  /*
   * Dispose 
   */
  dispose() {
    // Resets the references to others objects
    this.world3d = null;
  }

  /*
   * Code processed in the update loop 
   */
  update(delta) {
    if (!this.isLoadingOk) return;

    this.#refreshCumulWait += delta;
    if (this.#refreshCumulWait > 0.1) {
      
      this.#refreshCumulWait = 0.0;
    }

    TWEEN.update();
  }

}

export { Autopilot };
