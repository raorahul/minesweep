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

    // Setup the canvas.
    new gameItems.Minesweep('container');

  });
})();
