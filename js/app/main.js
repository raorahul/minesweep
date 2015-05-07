/*jshint unused:vars*/
/*jshint undef:true*/
/*global
require
*/
(function () {
  'use strict';

  require.config({
    baseUrl: 'js/app'
  });


  // Start the main app logic.
  require(['game-items'], function (gameItems)  {

    var configs = {
      'rows': 4,
      'cols': 6,
      'mines': 10
    };
    // Setup the canvas.
    new gameItems.Minesweep('container', configs);

  });
})();
