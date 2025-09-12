const exploreScript = {

  initPage: () => {
    // Sets the event handlers
    document.querySelector('#atlas-link2').addEventListener(
      'click', () => {
        goToPage('#atlas');
      }
    );
    document.querySelector('#atlas-link3').addEventListener(
      'click', () => {
        goToPage('#atlas');
      }
    );
  },

  preparePage: () => {
    //
  },

};

pageScripts.set('#explore', exploreScript);
