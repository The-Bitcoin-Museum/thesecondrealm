import {
  LineSegments,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  Vector3
} from 'three';

import { POS_FARFAR_AWAY } from '../data/positions-constants.js';


class Autopilot extends LineSegments {

  /*
   * Constants
   */

  static COORD_HEIGHT = 'block_height';
  static COORD_DATA= 'data_series';

  static DEFAULT_SPEED = 1500;


  /* 
   * Attributes
   */

  #refreshCumulWait = 0;

  world3d = null;

  version = null;
  title = null;
  coordTypes = null;
  stages = [];
  curve = null;
  enabled = false;
  isLoadingOk = false;
  
  

  /*
   * Constructor 
   */
  constructor(world3d) {
    const geometry = new BoxGeometry(1000, 1000, 1000);
    const edgesGeometry = new EdgesGeometry(geometry);
    const material = new LineBasicMaterial({ color: 0x590000 });
    super(edgesGeometry, material);

    this.setProbePosition(POS_FARFAR_AWAY[0]);

    this.world3d = world3d;
  }

  /*
   * Load the descriptor file 
   */
  async load(url) {
    this.isLoadingOk = false;
    const path = [];

    const tourDescriptor = await dataStore.getTourDescriptorFile(url);
    if (!tourDescriptor) {
      return []; 
    }
    
    this.title = tourDescriptor['title'];
    this.version = tourDescriptor['version'];
    this.coordTypes = tourDescriptor['coords_type'];

    // Forces initial position in front of the camera
    const initPos = new Vector3(0, 0, -50000);
    const initPosWorld = new Vector3();
    this.world3d.camera.parent.localToWorld(initPosWorld.copy(initPos));
    this.initialPosition = [initPosWorld.x, initPosWorld.y, initPosWorld.z];
    // Adds initial position to the path
    path.push(this.initialPosition);
    // Builds the tour and the path
    for (let stage of tourDescriptor['stages']) {
      const pos = this.getWorld3dPosition(stage['coords']);
      if (pos == null)
        continue;
      this.stages.push({'coords': pos});
      path.push(pos);
    }

    this.isLoadingOk = true;
    return path;
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
    
    // Deactivates the selection tool during the tour
    this.world3d.selectionHelper.isActive = false; 

    this.displayIntroductoryMessage();
  } 

  /*
   * On tour complete
   */
  onTourComplete() {
    this.displayGoodByeMessage();
  }

  /*
   * Display an introductory message 
   */
  displayIntroductoryMessage() {
    const title = `Welcome to our tour\n"${this.title}"`;
    let content1 = `You've entered The Second Realm, a purely digital space.\n\nEach point composing the point cloud in front of you represents a Bitcoin block, with its position defined by three attributes of the block.\n\n`;
    content1 += `Our automated wandering is about to begin.\n\nWe hope that you'll enjoy the ride.`;
    const content2 = `Press the A button of the joystick to start this trip.`;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Display a message when the dataship is moving 
   */
  displayOnTheMoveMessage() {
    const title = ``;
    let content1 = ``;
    const content2 = ``;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Display a good bye message 
   */
  displayGoodByeMessage() {
    const title = `Thank you!`;
    const content1 = `This is the end of our automated wandering.\n\nWe hope that you have enjoyed your ride with us and that it has made you want to explore this realm on your own.\n\nPress the meta button to leave this realm.`;
    const content2 = ``;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Display a progress message
   */
  displayProgressMessage(currentTime, totalDuration) {
    const remaining = Math.floor((totalDuration - currentTime) / 1000);
    const title = `Expected Time of Arrival`;
    const content1 = `Our dataship is expected to arrive at destination in \n${remaining} seconds.`;
    const content2 = ``;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Position the probe at a given position 
   */
  setProbePosition(position) {
    this.position.x = position[0];
    this.position.y = position[1];
    this.position.z = position[2];
    this.updateMatrixWorld(true);
  }

  /*
   * Code processed in the update loop 
   */
  update(delta) {
    if (!this.isLoadingOk) return;
    this.#refreshCumulWait += delta;
    if (this.#refreshCumulWait > 0.1) {
      // Pauses the tour if we're less than 5s from the end of the tour
      const controller = this.world3d.controller;
      const remainingDuration = controller.totalDuration - controller.effectiveTime;
      if (controller.isRunning()) {
        if (remainingDuration < 10000) {
          controller.pause();
          this.displayGoodByeMessage();
        } else {
          this.displayProgressMessage(controller.effectiveTime, controller.totalDuration);
        }
      }
      this.#refreshCumulWait = 0.0;
    }
  }

  /*
   * Dispose 
   */
  dispose() {
    // Resets the references to others objects
    this.world3d = null;
    this.curve = null;
  }

}

export { Autopilot };
