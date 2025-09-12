import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {
  fetchProfile,
  MotionController 
} from '/js/libs/@webxr-input-profiles/motion-controllers.module.js';


class WebXRManager extends EventTarget {

  /*
   * Constants
   */

  static SESSION_INIT = { 
    requiredFeatures: [
      'local',
    ],
    optionalFeatures: [
      'local-floor',
      'high-refresh-rate',
      'high-fixed-foveation-level',
      'ca-correction',
      'bounded-floor', 
      'hand-tracking', 
      'layers'
    ]
  };

  static ASSETS_URI = '/static/webxr/profiles'


  /*
   * Attributes
   */

  world3d = null;
  session = null;
  loader = null;

  controllers = [];
  controllerInputSources = [];
  controllerModels = [];

  // Hack (required for some browsers) 
  #xrSessionIsGranted = false;


  /*
   * Constructor 
   */
  constructor(world3d) {
    super();

    this.world3d = world3d;
    this.loader = new GLTFLoader();

    if (typeof navigator !== 'undefined' && 'xr' in navigator) {
			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if (/WebXRViewer\//i.test( navigator.userAgent)) return;
			navigator.xr.addEventListener('sessiongranted', () => {
				this.#xrSessionIsGranted = true;
			});
		}

    if (navigator.xr.offerSession !== undefined) {
      navigator.xr.offerSession('immersive-vr', WebXRManager.SESSION_INIT)
        .then(this.onSessionStarted.bind(this))
        .catch(err => {
          console.warn(err);
        });
    }
  }

  /*
   * onSessionStarted event handler
   */
  async onSessionStarted(session) {
    session.addEventListener('end', this.onSessionEnded.bind(this));
    session.addEventListener('inputsourceschange', this.onInputSourcesChange.bind(this));
    this.session = session;
    this.dispatchEvent(new Event('sessionstart'));
  }

  /*
   * onSessionEnded event handler
   */
  onSessionEnded( /*event*/ ) {
    this.session.removeEventListener('end', this.onSessionEnded);
    this.session = null;
    this.dispose();
    this.dispatchEvent(new Event('sessionend'));
  }

  /*
   * onInputSourcesChange event handler
   */
  async onInputSourcesChange(e) {
    for (let i = 0; i < e.removed.length; i++) {
      const inputSource = e.removed[i];
      const index = this.controllerInputSources.indexOf(inputSource);
      if (index >= 0) {
        this.controllerInputSources[index] = null;
        this.controllers[index] = null;
        // this.controllerModels[index].dispose();
        this.controllerModels[index] = null;
      }
    }

    // Checks that we still have an active xr session
    if (!this.session) return;

    for (let i = 0; i < e.added.length; i++) {
      const inputSource = e.added[i];
      let {profile, assetPath} = await fetchProfile(inputSource, WebXRManager.ASSETS_URI);
      // Forces use of meta quest touch plus model for now
      let tokens = assetPath.split('/');
      tokens[tokens.length - 2] = 'meta-quest-touch-plus';
      assetPath = tokens.join('/');
      const motionController = new MotionController(inputSource, profile, assetPath);

      let controllerIndex = -1;
      await this.loader.load(motionController.assetUrl, (glb) => {
        let controllerModel = glb.scene;
        controllerModel.rotation.x = Math.PI / 4;
        controllerIndex = this.controllerInputSources.indexOf(inputSource);
        if (controllerIndex === - 1) {
          // Assign input source a controller that currently has no input source
          for (let j = 0; j < 2; j++) {
            if (j >= this.controllerInputSources.length) {
              this.controllerInputSources.push(inputSource);
              this.controllers.push(motionController);
              this.controllerModels.push(controllerModel);
              this.world3d.renderer.xr.getController(j).add(controllerModel);
              controllerIndex = j;
              break;
            } else if (this.controllerInputSources[j] === null) {
              this.controllerInputSources[j] = inputSource;
              this.controllers[j] = motionController;
              this.controllerModels[j] = controllerModel;
              this.world3d.renderer.xr.getController(j).add(controllerModel);
              controllerIndex = j;
              break;
            }
          }
        }
      }, undefined, (error) => {
        console.error(error);
      });

      // // If all controllers do currently receive input we ignore new ones
      // if (controllerIndex === - 1) break;
    }
  }

  /*
   * Start a new XR session
   */
  startSession() {
    if (this.session === null) {
      navigator.xr.requestSession(
        'immersive-vr', 
        WebXRManager.SESSION_INIT
      ).then(
        this.onSessionStarted.bind(this)
      );
    } else {
      this.session.end();
      if (navigator.xr.offerSession !== undefined) {
        navigator.xr.offerSession(
          'immersive-vr', 
          WebXRManager.SESSION_INIT
        ).then(
          this.onSessionStarted.bind(this)
        ).catch( err => {
          console.warn(err);
        });
      }
    }
  }

  /*
   * Animation loop
   */
  update(delta) {
    Object.values(this.controllers).forEach(controller => {
      if (controller != null) {
        controller.updateFromGamepad();
      }
    });
  }


  /**
   * Clear the WebXRManager object
   */
  dispose() {
    this.world3d = null;
    this.session = null;
    this.loader = null;

    this.controllers = [];
    this.controllerInputSources = [];
    this.controllerModels = [];
  }

}

export { WebXRManager };
