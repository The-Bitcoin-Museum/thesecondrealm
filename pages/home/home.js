const homeScript = {

  initPage: () => {
    // Sets the event handlers
    document.querySelector('#here-link').addEventListener(
      'click', () => {
        goToPage('#explore');
      }
    );

    document.querySelector('#explorer-link').addEventListener(
      'click', () => {
        goToPage('#explore');
      }
    );

    document.querySelector('#builder-link').addEventListener(
      'click', () => {
        goToPage('#configurator');
      }
    );

    document.querySelector('#teller-link').addEventListener(
      'click', () => {
        goToPage('#tell');
      }
    );

    document.querySelector('#landscaper-link').addEventListener(
      'click', () => {
        goToPage('#shape');
      }
    );
  },

  preparePage: () => {
    //
  },

};

pageScripts.set('#home', homeScript);
