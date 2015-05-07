/*jshint unused:vars*/
/*jshint undef:true*/
/*global
define, createjs, document, window, console
*/

(function (){
  'use strict';

  define(function () {

    // Add canvas type code here.
    var gameItems = {};
    var proto;

    // Represents a single cell.
    function Tile (tileId) {
      this._flag = false;
      this._open = false;
      this._mine = false;
      this._counter = '';


      this.tileId = tileId;
      this.nbTop = null;
      this.nbRight = null;
      this.nbLeft = null;
      this.nbBottom = null;

      this.stage = null;

      this._container = null;
      this._tileRect = null;
    }
    proto = Tile.prototype;

    proto.setupView = function (stage, x, y, width, height) {
      this.stage = stage;
      this._container = new createjs.Container();
      this._tileRect = new createjs.Shape();
      this._tileRect.graphics
      .f('#d8d8d8')
      .r(0, 0, width, height)
      .ss(2)
      .s('#646464')
      .r(0, 0, width, height);
      this._container.addChild(this._tileRect);

      this.stage.addChild(this._container);
    };

    // The game manager.
    function Minesweep (containerId, configs) {

      /*
                PRIVATE VARIABLES
       */

      this._containerId = containerId;
      this._configs = configs;
      this._pixelRatio = window.devicePixelRatio || 1;
      var dimensions = 20 * this._pixelRatio;
      this._tileWidth = dimensions;
      this._tileHeight = dimensions;

      this._topOffset = dimensions;
      this._leftOffset = dimensions;

      this._stageWidth = 0;
      this._stageHeight = 0;

      this._canvasNode = null;
      this._containerNode = null;

      this._stage = null;

      // this._screenX = 0;
      // this._screenY = 0;

      /*
        SETUP
       */
      this._setup();
    }

    proto = Minesweep.prototype;

    proto._setup = function () {

      if (!this._containerId || !this._configs) {
        console.log('Error - not setup correctly');
        return null;
      }

      // Add the canvas DOM element.
      this._containerNode = document.getElementById(this._containerId);
      if (!this._containerNode) {
        return;
      }

      this._stageWidth = this._leftOffset + (this._configs.cols * this._tileWidth);
      this._stageHeight = this._topOffset + (this._configs.rows * this._tileHeight);

      this._containerNode.innerHTML = '<canvas id="canvas-type" width=" ' + this._stageWidth + '" height="' + this._stageHeight + '"></canvas>';
      // this._containerNode.insertAdjacentHTML('beforeend', '<canvas id="canvas-type" width=" ' + this._stageWidth + '" height="' + this._stageHeight + '"></canvas>');
      this._canvasNode = document.getElementById('canvas-type');

      this._canvasNode.style.width =  (this._stageWidth / this._pixelRatio) + 'px';
      this._canvasNode.style.height =  (this._stageHeight / this._pixelRatio) + 'px';

      // Setup the stage.
      this._stage = new createjs.Stage(this._canvasNode);
      createjs.Touch.enable(this._stage);
      this._stage.enableMouseOver(20);

      // Draw the wrapper container.
      this._setupTiles();

      // this._setupArtwork();

      // this._setupTextBanner();

      // Every thing's done drawing - update stage.
      this._stage.update();
    };

    proto._setupTiles = function () {
      var rows = this._configs.rows;
      var cols = this._configs.cols;
      var counter = 0;
      // var totalCells = rows * cols;

      var i;
      var rowY = 0;
      var j;
      var tile;
      for (i = 0; i < rows; ++i) {

        rowY = i * this._tileHeight;

        for (j = 0; j < cols; ++j) {
          tile = new Tile('' + counter);
          tile.setupView(this._stage, (j * this._tileWidth), rowY, this._tileWidth, this._tileHeight);
        }

        j = 0;
      }
    };




    // proto._setupArtwork = function () {

    //   // Setup the ground.
    //   var groundImg = this._loader.getResult("ground");
    //   this._ground = new createjs.Shape();
    //   this._ground.graphics.beginBitmapFill(groundImg).drawRect(0, 0, this._screenWidth, groundImg.height);
    //   this._ground.tileW = groundImg.width;
    //   this._ground.y = this._screenY + (this._screenHeight >> 1) - groundImg.height;
    //   this._ground.x = this._screenX;

    //   this._stage.addChild(this._ground);

    //   // Setup grant.
    //   var self = this;
    //   var spriteSheet = new createjs.SpriteSheet({
    //                              framerate: 30,
    //                              "images": [self._loader.getResult("grant")],
    //                              "frames": {"regX": 0, "height": 292, "count": 64, "regY": 0, "width": 165},
    //                              // define animation, run (loops, 1.5x speed).
    //                              "animations": {
    //                                "run": [0, 25, "run", 1.5]
    //                              }
    //                            });
    //     this._grant = new createjs.Sprite(spriteSheet, "run");
    //     this._grant.y = this._ground.y - 292;
    //     this._grant.x = this._screenX + 10;
    //     this._stage.addChild(this._grant);

    //     createjs.Ticker.timingMode = createjs.Ticker.RAF;
    //     createjs.Ticker.addEventListener("tick", function (evt) {
    //       self._tick(evt);
    //     });
    // };

    // proto._tick = function (event) {
    //   this._stage.update(event);
    // };

    // proto._setupTextBanner = function () {
    //   var domNode = document.getElementById('banner');
    //   if (!domNode) {
    //     return;
    //   }

    //   this._domElem = new createjs.DOMElement(domNode);
    //   this._domElem.htmlElement.style.display = "block";
    //   var elemWidth = 200;
    //   this._domElem.htmlElement.style.width = elemWidth + 'px';
    //   this._domElem.x = ((this._screenX + this._screenWidth) / this._pixelRatio) - elemWidth - 10;
    //   this._domElem.y = (this._screenY + (this._screenHeight >> 1) - 200) / this._pixelRatio;
    //   this._stage.addChild(this._domElem);
    // };

    gameItems.Minesweep = Minesweep;
    return gameItems;

  });
})();
