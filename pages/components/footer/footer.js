const footerScript = {

  initComponent: () => {
    document.querySelector('#credits-link').addEventListener(
      'click', () => {
        goToPage('#credits');
      }
    );
  },

  /*
   * Refreshes the component when active page change
   */
  refresh: () => {},

};

componentScripts.set('#footer', footerScript);

waitForElement("#p2prights-link", 1000).then(() => {
  footerScript.initComponent();
}).catch(() => {});
