import {
  Scene,
  WebGLRenderer
} from 'three';

import { Camera } from '/js/modules/3d/camera.js';
import { Cube } from '/js/modules/3d/cube.js'; 


const troubleshooting = {

  XR_SESSION_INIT: { 
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
  },

  xrSession: null,
  scene: null,
  renderer: null,
  camera: null,


  initPage: () => {
    // Sets the event handlers
    document.querySelector('#xr-diagnosis-btn').addEventListener(
      'click', () => { troubleshooting.runXrDiagnosis(); }
    );
  },


  runXrDiagnosis: () => {
    document.querySelector('#xr-diagnosis-text').value = ``;
    try {
      // Initializes 3d elements
      let gridContainer = document.getElementById('container');
      troubleshooting.scene = new Scene();
      troubleshooting.camera = new Camera(null);
      troubleshooting.scene.add(troubleshooting.camera.parent);
      troubleshooting.camera.moveTo([500,500,500], [0,0,0]);
      let cube = new Cube();
      troubleshooting.scene.add(cube);
      cube.build(1000, 0x1f1f1f);
      troubleshooting.renderer = new WebGLRenderer();
      troubleshooting.renderer.xr.enabled = true;
      gridContainer.appendChild(troubleshooting.renderer.domElement);
      troubleshooting.renderer.setAnimationLoop(troubleshooting.processRendering);
      // Initialiazes the webxr session
      if (typeof navigator !== 'undefined' && 'xr' in navigator) {
        if (/WebXRViewer\//i.test(navigator.userAgent)) return;
        navigator.xr.addEventListener('sessiongranted', () => {
          document.querySelector('#xr-diagnosis-text').value += 'WebXR session granted';
        });
      }

      if (navigator.xr.offerSession !== undefined) {
        navigator.xr.offerSession('immersive-vr', troubleshooting.XR_SESSION_INIT)
          .then(troubleshooting.onSessionStarted)
          .catch(err => {
            document.querySelector('#xr-diagnosis-text').value += 'A problem was met while trying to start the webxr session:\n'
            document.querySelector('#xr-diagnosis-text').value += JSON.stringify(err, null, 2) + '`n';
          });
      }
    } catch (e) {
      document.querySelector('#xr-diagnosis-text').value += 'A problem was met:\n'
      document.querySelector('#xr-diagnosis-text').value += `${e}\n`;
    }

    troubleshooting.startSession();
  },

  onSessionStarted: (session) => {
    troubleshooting.xrSession = session;
    troubleshooting.renderer.xr.setSession(session);
    session.addEventListener('end', troubleshooting.onSessionEnded);
    session.addEventListener('inputsourceschange', troubleshooting.onInputSourcesChange);
    document.querySelector('#xr-diagnosis-text').value += 'WebXR session successfully started\n\n';
  },

  onSessionEnded: () => {
    troubleshooting.xrSession.removeEventListener('end', troubleshooting.onSessionEnded);
    troubleshooting.xrSession = null;
    document.querySelector('#xr-diagnosis-text').value += 'WebXR session successfully ended\n\n';
  },

  onInputSourcesChange: (e) => {
    try {
      let content = '';
      for (let i = 0; i < e.added.length; i++) {
        const inputSource = e.added[i];
        content += `Input Source ${i} detected:\n`;
        content += JSON.stringify(e.added[i].profiles, null, 2) + '\n\n';
      }
      document.querySelector('#xr-diagnosis-text').value += content;
    } catch (e) {
      document.querySelector('#xr-diagnosis-text').value += 'A problem was met while processing input sources change:\n'
      document.querySelector('#xr-diagnosis-text').value += `${e}\n`;
    }
  },

  startSession: () => {
    try {
      if (troubleshooting.xrSession === null) {
        navigator.xr.requestSession(
          'immersive-vr', 
          troubleshooting.XR_SESSION_INIT
        ).then(
          troubleshooting.onSessionStarted
        );
      } else {
        troubleshooting.xrSession.end();
        if (navigator.xr.offerSession !== undefined) {
          navigator.xr.offerSession(
            'immersive-vr', 
            troubleshooting.XR_SESSION_INIT
          ).then(
            troubleshooting.onSessionStarted
          ).catch( err => {
            document.querySelector('#xr-diagnosis-text').value += 'A problem was met while trying to start the webxr session:\n'
            document.querySelector('#xr-diagnosis-text').value += JSON.stringify(err, null, 2) + '`n';
          });
        }
      }
    } catch (e) {
      document.querySelector('#xr-diagnosis-text').value += 'A problem was met:\n'
      document.querySelector('#xr-diagnosis-text').value += `${e}\n`;
    }
  },

  processRendering: () => {
    troubleshooting.renderer.render(troubleshooting.scene, troubleshooting.camera);
  }

}

// Inits the page
troubleshooting.initPage();
