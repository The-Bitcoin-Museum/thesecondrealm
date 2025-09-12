import {
  Cache,
  Scene,
  AmbientLight
} from 'three';

import { Cube } from './cube.js';
import { HUD } from './hud/hud.js';
import { GuidedTour } from './guided-tour.js';
import { Autopilot } from './autopilot.js';
import { Camera } from './camera.js';
import { PointsCloud } from './points-cloud.js';
import { SoundSystem } from './sound-system.js';
import { FlyController } from './fly-controller.js';
import { Renderer } from './renderer.js';
import { WebXRManager } from '../webxr/webxr-manager.js';
import { CUBE_SIZE } from '../data/positions-constants.js';
import { SelectionHelper } from './selection/selection-helper.js';


class World3D {

  /*
   * Constants
   */

  // PointsCloud display mode
  static DISPLAY_MODE_STATIC = 1;
  static DISPLAY_MODE_ANIMATION = 2;

  /**
   * Attributes
   */

  // Children
  scene = null;
  renderer = null;
  container = null;
  camera = null;
  hud = null;
  controller = null; 
  soundSystem = null;
  pointsCloud = null;
  xrManager = null;
  guidedTour = null;
  autopilot = null;
  selectionHelper = null;

  // Boolean flag indicating if loading has completed
  immersionModeActivated = false;


  /*
   * Constructor
   */
  constructor(container) {
    //Cache.enabled = true;

    this.container = container;

    this.scene = new Scene();
    this.#initCamera();
    this.#initRenderer();
    this.#initController();
    this.#initSelectionHelper();
    this.#initHUD();
    this.#initXrSession();
    this.#initLights();
    this.#initGrid();
    this.#initAudio();

    this.renderer.renderLoopEnabled = true;

    this.renderer.animate();
  }

  /*
   * Initialize the camera
   */
  #initCamera() {
    this.camera = new Camera(this);
    this.scene.add(this.camera.parent);
  }

  /*
   * Initialize the renderer
   */
  #initRenderer() {
    this.renderer = new Renderer(this);
  }

  /*
   * Initialize the current controls
   */
  #initController() {
    this.controller = new FlyController(this);
  }

  /*
   * Initialize the XR session
   */
  #initXrSession() {
    this.xrManager = new WebXRManager(this);
    this.xrManager.addEventListener(
      'sessionstart', 
      this.renderer.onSessionStart.bind(this.renderer)
    );
    this.xrManager.startSession();
  }
        
  /*
   * Initialize the lights
   */ 
  #initLights() {
    // Creates an ambient light
    let ambientLight = new AmbientLight(0x202020);
    this.scene.add(ambientLight);
  }

  /*
   * Initialize a HUD
   */
  #initHUD() {
    this.hud = new HUD(this);
  }

  /*
   * Initialize the grid
   */
  #initGrid() {
    let cube = new Cube();
    this.scene.add(cube);
    cube.build(CUBE_SIZE, 0x1f1f1f);
  }

  /*
   * Initialize the audio elements 
   */
  #initAudio() {
    this.soundSystem = new SoundSystem();
  }

  /*
   * Initialize the audio elements 
   */
  #initSelectionHelper() {
    this.selectionHelper = new SelectionHelper(this);
    this.scene.add(this.selectionHelper);
  }
    
  /*
   * Initialize the GuidedTour object 
   */
  initGuidedTour() {
    this.guidedTour = new GuidedTour(this);
    this.scene.add(this.guidedTour);
  }

  /*
   * Initialize the Autopilot object 
   */
  initAutopilot() {
    this.autopilot = new Autopilot(this);
  }

  /**
   * Display a PointsCloud
   */
  displayPointsCloud(cloudData, mode) {
    // Disposes the PointsCloud if it already exists
    if (this.pointsCloud != null) {
      this.scene.remove(this.pointsCloud);
      this.pointsCloud.dispose(); 
    }
    // Initializes the PointsCloud
    this.pointsCloud = new PointsCloud(
      this,
      cloudData.dataPoints.length, 
      CUBE_SIZE
    );
    // Displays the PointsCloud  
    this.scene.add(this.pointsCloud);
    if (mode == World3D.DISPLAY_MODE_STATIC) {
      this.pointsCloud.showPointsCloud(cloudData);
    } else {
      this.pointsCloud.prepareAnimation(cloudData);
    }
    this.renderer.setFocus();
  }

  /**
   * Clear the World3D object
   */
  dispose() {
    this.immersionModeActivated = false;
    // Removes the event listeners 
    this.xrManager.removeEventListener(
      'sessionstart', 
      this.renderer.onSessionStart.bind(this.renderer)
    );
    // Disposes the renderer 
    this.renderer.dispose();
    // Disposes the sound system
    this.soundSystem.stop();
    this.soundSystem.dispose();
    // Disposes the camera
    this.camera.dispose();
    // Disposes the controller
    this.controller.dispose();
    // Disposes the points cloud
    this.pointsCloud.dispose();
    // Disposes the hud
    this.hud.dispose();
    // Disposes the selection helper
    this.selectionHelper.dispose();
    // Disposes the guided tour
    if (this.guidedTour) {
      this.guidedTour.dispose();
    }
    // Disposes the autopilot
    if (this.autopilot) {
      this.autopilot.dispose();
    }
    // Disposes the Tree of Object3D
    this.disposeObjectTree(this.scene);
    // Resets the references to others objects
    this.scene = null;
    this.renderer = null;
    this.container = null;
    this.camera = null;
    this.hud = null;
    this.controller = null; 
    this.soundSystem = null;
    this.pointsCloud = null;
    this.selectionHelper = null;
    this.xrManager = null;
    this.guidedTour = null;
    this.autopilot = null;
  }

  isRenderItem(obj) {
    return 'geometry' in obj && 'material' in obj;
  }

  disposeMaterial(obj) {
    if (!this.isRenderItem(obj)) return;
    // because obj.material can be a material or array of materials
    const materials = [].concat(obj.material);
    for (const material of materials) {
      material.dispose();
    }
  }

  disposeObject(
    obj, 
    removeFromParent = true, 
    destroyGeometry = true, 
    destroyMaterial = true
  ) {
    if (!obj) return;

    if (this.isRenderItem(obj)) {
      if (obj.geometry && destroyGeometry) {
        obj.geometry.dispose();
      }
      if (destroyMaterial) {
        this.disposeMaterial(obj);
      }
    }

    removeFromParent 
      && Promise.resolve().then(() => {
        // if we remove children in the same tick then we can't continue traversing,
        // so we defer to the next microtask
        obj.parent && obj.parent.remove(obj)
      });
  }

  disposeObjectTree(
    obj,
    removeFromParent = true, 
    destroyGeometry = true, 
    destroyMaterial = true
  ) {
    obj.traverse(node => {
      this.disposeObject(node, removeFromParent, destroyGeometry, destroyMaterial);
    });
  }

}

export { World3D };
