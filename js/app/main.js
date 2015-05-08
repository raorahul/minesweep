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
      'rows': 10,
      'cols': 12,
      'mines': 10,
      'tileWidth': 40,
      'tileHeight': 40
    };
    // Setup the canvas.
    new gameItems.Minesweep('container', configs);

  });
})();
