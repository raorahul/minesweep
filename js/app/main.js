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

    var button;
    var game;

    var configs = {
      'rows': 10,
      'cols': 12,
      'mines': 40,
      'tileWidth': 40,
      'tileHeight': 40,
      'showMines': false
    };

    button = document.getElementById('reset-button');
    button.addEventListener('click', function(e) {
      game = new gameItems.Minesweep('container', configs);
    });

    // Setup the canvas.
    game = new gameItems.Minesweep('container', configs);

  });
})();
