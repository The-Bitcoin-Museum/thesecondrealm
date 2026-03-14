import { 
  Vector3
} from 'three';
import { GuidedTour } from './guided-tour.js';


class GuidedTourAutopilot extends GuidedTour {

  /* 
   * Attributes
   */

  #refreshCumulWait = 0;


  /*
   * Constructor
   */
  constructor(world3d) {
    super(world3d);
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
      if (pos == null) return [];
      
      this.stages.push({
        'coords': pos,
        'title': stage['title'],
        'content': stage['desc']
      });

      path.push(pos);
    }

    this.isLoadingOk = true;
    return path;
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
      if (this.getDistanceToProbe() <= 500) {
        if (!this.world3d.controller.transitionRequested) {
          // Pauses the movement
          this.world3d.controller.pause();
        }
        // Moves the probe to the next stage of the trip
        // and displays the associated description
        this.switchToNextStage();
      }
      this.#refreshCumulWait = 0.0;
    }
  }
  
  /*
   * On tour complete
   */
  onTourComplete() {
  }

  /*
   * Display an introductory message 
   */
  displayIntroductoryMessage() {
    const title = `Welcome to our guided tour\n"${this.title}"`;

    let content1 = `You've entered The Second Realm, a purely digital space.\n\nEach point composing the point cloud in front of you represents a Bitcoin block, with its position defined by three attributes of the block.\n\n`;
    content1 += `During your journey into this realm, you'll be guided by a probe that localizes the points of interest. It looks like a pulsating red cube. You should be able to see it if you look around.`;
    const content2 = `Press the A button of the joystick to start the tour.`;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Display a message when the dataship is moving 
   */
  displayOnTheMoveMessage() {
    const title = `Fasten yout seatbelt`;
    let content1 = `We're moving to the next point of interest.`;
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
    const content2 = `When you're ready, press the A button of the joystick to continue the tour.`;
    this.world3d.hud.leftScreen.displayMessage(title, content1, content2);
  }

  /*
   * Move to next stage of the trip 
   */
  switchToNextStage() {
    super.switchToNextStage();
    if (this.currentStage == this.stages.length) {
      this.world3d.controller.pause();
    }
  }

}

export { GuidedTourAutopilot };