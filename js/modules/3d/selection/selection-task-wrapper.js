import { processMessage } from '/js/modules/3d/selection/selection-task.js';

self.onmessage = function(e) {
  const result = processMessage(e);
  postMessage(result);
};
