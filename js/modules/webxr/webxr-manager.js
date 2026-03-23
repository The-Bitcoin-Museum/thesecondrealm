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
  controllers = new Map();

  // Hack (required for some browsers) 
  #xrSessionIsGranted = false;


  /*
   * Constructor 
   */
  constructor(world3d) {
    super();

    this.world3d = world3d;
    this.loader = new GLTFLoader();

    // Initializes the controller objects
    for (let i = 0; i < 2; ++i) {
      const controller = this.world3d.renderer.xr.getController(i);
      if (controller == null) continue;
      this.world3d.camera.parent.add(controller);
    }

    // Offer webxr session if it's supported by the browser
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
    try {
      for (let i = 0; i < e.removed.length; i++) {
        let inputSource = e.removed[i];
        if (this.controllers.has(inputSource.handedness)) {
          const obj = this.controllers.get(inputSource.handedness);
          this.world3d.camera.parent.remove(obj['controller']);
          if (obj['model']) {
            obj['controller'].remove(obj['model']);
          }
          this.controllers.delete(inputSource.handedness);
        }
      }

      // Checks that we still have an active xr session
      if (!this.session) {
        return;
      }

      for (let i = 0; i < e.added.length; i++) {
        let inputSource = e.added[i];
        let {profile, assetPath} = await fetchProfile(inputSource, WebXRManager.ASSETS_URI);

        // Forces use of meta quest touch plus model for now
        let tokens = assetPath.split('/');
        tokens[tokens.length - 2] = 'meta-quest-touch-plus';
        assetPath = tokens.join('/');
        const motionController = new MotionController(inputSource, profile, assetPath);

        await this.loader.load(motionController.assetUrl, (glb) => {
          let controllerModel = glb.scene;
          controllerModel.rotation.x = Math.PI / 4;

          if (this.controllers.has(inputSource.handedness)) return;

          let index = -1;
          for (let i = 0; i < this.session.inputSources.length; i++) {
            if (this.session.inputSources[i].handedness == inputSource.handedness) {
              index = i;
              break;
            }
          }
          if (index === -1) return;

          let controller = this.world3d.renderer.xr.getController(index);
          if (!this.world3d.camera.parent.children.includes(controller)) {
            this.world3d.camera.parent.add(controller);
          }
          if (!controller.children.includes(controllerModel)) {
            controller.add(controllerModel);
          }

          this.controllers.set(inputSource.handedness, {
            'inputSource': inputSource,
            'controller': controller,
            'motionController': motionController, 
            'model': controllerModel
          });

        }, undefined, (error) => {
          console.error(error);
        });

      }
    } catch (e) {
      console.error(e);
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
    try {
      for (let obj of this.world3d.xrManager.controllers.values()) {
        const controller = obj['motionController'];
        if (controller != null) {
          controller.updateFromGamepad();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }


  /**
   * Clear the WebXRManager object
   */
  dispose() {
    this.world3d = null;
    this.session = null;
    this.loader = null;

    this.controllers = null;
  }

}

export { WebXRManager };
