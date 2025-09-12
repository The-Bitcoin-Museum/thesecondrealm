import { SceneParams } from "/js/modules/data/scene-params.js";


const payloadUtils = {

  initPage: () => {
    // Sets the event handlers

    // Buttons
    document.querySelector('#decode-btn').addEventListener(
      'click', () => { payloadUtils.decode(); }
    );

    document.querySelector('#encode-btn').addEventListener(
      'click', () => { payloadUtils.encode(); }
    );
  },

  // Decode a Base58 payload
  // and returns a JSON
  decode: () => {
    let sceneParams, jsonPayload;

    const b58Payload = document.querySelector('#b58-text').value;
    
    try {
      sceneParams = SceneParams.unserialize(b58Payload);
    } catch {
      alert('An error occurred while trying to unserialize the Base58 payload');
      return;
    }
    
    try {
      jsonPayload = sceneParams.toJSON(2);
    } catch {
      alert('An error occurred while trying to build the JSON payload');
      return;
    }
    
    document.querySelector('#json-text').value = jsonPayload;
  },

  // Encode a JSON 
  // into a Base58 payload
  encode: () => {
    let sceneParams, b58Payload;

    const jsonPayload = document.querySelector('#json-text').value;
    
    try {
      sceneParams = SceneParams.fromJSON(jsonPayload);
    } catch {
      alert('An error occurred while trying to unserialize the JSON payload');
      return;
    }
    
    try {
      b58Payload = sceneParams.serialize();
    } catch {
      alert('An error occurred while trying to srialize the payload');
      return;
    }
    
    document.querySelector('#b58-text').value = b58Payload;
  },

}

// Inits the page
payloadUtils.initPage();
