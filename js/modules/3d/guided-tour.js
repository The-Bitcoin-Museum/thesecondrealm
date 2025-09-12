import { 
  Vector3,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  LineSegments,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial
} from 'three';

import { POS_FARFAR_AWAY } from '../data/positions-constants.js';


class GuidedTour extends LineSegments {

  /*
   * Constants
   */

  static COORD_HEIGHT = 'block_height';
  static COORD_DATA= 'data_series';

  static COLORS_PALETTE = [
    0x590000,
    0x6c0000,
    0x760000,
    0x890000,
    0x9b0000,
    0xae0000,
    0xbb0000,
    0xcb0000,
    0xdb0000,
    0xf00000,
    0xdb0000,
    0xcb0000,
    0xbb0000,
    0xae0000,
    0x9b0000,
    0x890000,
    0x760000,
    0x6c0000,
  ];

  /* 
   * Attributes
   */

  world3d = null;

  version = null;
  title = null;
  coordTypes = null;
  initialPosition = null;
  stages = [];

  currentStage = -1;

  #probeColorAnimCtr = 0;
  #refreshCumulWait = 0;

  isLoadingOk = false;


  /*
   * Constructor
   */
  constructor(world3d) {
    const geometry = new BoxGeometry(1000, 1000, 1000);
    const edgesGeometry = new EdgesGeometry(geometry);
    const material = new LineBasicMaterial({ color: GuidedTour.COLORS_PALETTE[0]});
    super(edgesGeometry, material);

    this.setProbePosition(POS_FARFAR_AWAY[0]);

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
    this.initialPosition = this.getWorld3dPosition(tourDescriptor['initial_pos']);
    if (this.initialPosition == null) return;

    for (let stage of tourDescriptor['stages']) {
      const pos = this.getWorld3dPosition(stage['coords']);
      if (pos == null) return;
      this.stages.push({
        'coords': pos,
        'title': stage['title'],
        'content': stage['desc']
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
    if (this.coordTypes == GuidedTour.COORD_DATA) {
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
    // Displays the introductory message
    this.displayIntroductoryMessage();
    // Moves the probe to the initial position
    if (this.initialPosition != null) {
      this.setProbePosition(this.initialPosition);
    }
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
   * Display an introductory message 
   */
  displayIntroductoryMessage() {
    const title = `Welcome to our guided tour\n"${this.title}"`;

    let content1 = `You've entered The Second Realm, a purely digital space.\n\nEach point composing the point cloud in front of you represents a Bitcoin block, with its position defined by three attributes of the block.\n\n`;
    content1 += `During your journey into this realm, you'll be guided by a probe that localizes the points of interest. It looks like a pulsating red cube. You should be able to see it if you look around.`;
    const content2 = `Get to the red probe to start the tour.`;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Display a good bye message 
   */
  displayGoodByeMessage() {
    const title = `Thank you!`;
    const content1 = `This last step marks the end of the tour.\n\nWe hope that you have enjoyed your ride with us and that it has made you want to explore this realm on your own.`;
    const content2 = ``;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Display content related to a given stage of the trip 
   */
  displayStageDescription(idxSage) {
    const stage = this.stages[idxSage];
    const title = `${stage.title}`;
    const content1 = `${stage.content}`;
    const content2 = `When you're ready, get to the red probe to continue the tour.`;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
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
      // Animates pulsations of the probe
      this.updateProbeColor(delta);
      // Checks our distance to the probe
      if (this.getDistanceToProbe() <= 1000) {
        // Moves the probe to the next stage of the trip
        // and displays the associated description
        this.switchToNextStage();
      }
      this.#refreshCumulWait = 0.0;
    }
  }

  /*
   * Compute the distance
   * between the probe and the camera 
   */
  getDistanceToProbe() {
    let cameraPos = new Vector3();
    this.world3d.camera.parent.getWorldPosition(cameraPos);
    let probePos = new Vector3();
    this.getWorldPosition(probePos);
    return cameraPos.distanceTo(probePos);
  }

  /*
   * Update the color of the probe
   */
  updateProbeColor(delta) {
    const nbColors = GuidedTour.COLORS_PALETTE.length;
    this.#probeColorAnimCtr = (this.#probeColorAnimCtr + 1) % nbColors;
    this.material.color.setHex(GuidedTour.COLORS_PALETTE[this.#probeColorAnimCtr]);
  }
  
  /*
   * Move to next stage of the trip 
   */
  switchToNextStage() {
    this.currentStage++;
    if (this.currentStage < this.stages.length) {
      this.displayStageDescription(this.currentStage);
      this.setProbePosition(this.stages[this.currentStage].coords);
    } else {
      this.currentStage = -1;
      this.setProbePosition(POS_FARFAR_AWAY[0]);
      this.displayGoodByeMessage();
      // Reactivates the selection tool during the tour
      this.world3d.selectionHelper.isActive = true; 
    }
  }

}

export { GuidedTour };
