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

      this.open = false;
      this.tileId = tileId;
      this.mine = false;
      this.nbTop = null;
      this.nbRight = null;
      this.nbLeft = null;
      this.nbBottom = null;

      this.nebs = {
        'top': null,
        'right': null,
        'bottom': null,
        'left': null,
        'topLeft': null,
        'topRight': null,
        'bottomLeft': null,
        'bottomRight': null
      };

      this.nebMineCount = {
        'top': 0,
        'right': 0,
        'bottom': 0,
        'left': 0
      };

      this.totalNebMines = 0;

      this.stage = null;
      this.gameManager = null;

      this._container = null;
      this._tileRect = null;
    }
    proto = Tile.prototype;

    proto.setupView = function (stage, x, y, width, height) {
      this.stage = stage;
      this._container = new createjs.Container();
      this._container.x = x;
      this._container.y = y;
      this._tileRect = new createjs.Shape();
      this._tileRect.graphics
      .f('#d8d8d8')
      .r(0, 0, width, height)
      .ss(2)
      .s('#646464')
      .r(0, 0, width, height);
      this._container.addChild(this._tileRect);
      this._container.setBounds(0, 0, width, height);

      this.stage.addChild(this._container);

      var self = this;
      this._container.on('click', function (event) {
        self.handleClick(event);
      });
    };

    proto.showMines = function () {
      var bounds = this._container.getBounds();
      this._tileRect.graphics
      .f('black')
      .r(0, 0, bounds.width, bounds.width);
    };

    proto.showMineCount = function () {
      if (this.mine || this.totalNebMines === 0) {
        return;
      }
      var bounds = this._container.getBounds();
      var textHt = bounds.height / 2.5;
      var text = new createjs.Text('' + this.totalNebMines, textHt + 'px Helvetica', 'black');


      var h = text.getMeasuredHeight();
      var w = text.getMeasuredWidth();

      text.x = (bounds.width - w) / 2;
      text.y = (bounds.height - h) / 2;

      this._container.addChild(text);
      // this.stage.update();
    };

    proto.handleClick = function (event) {
      if (event.nativeEvent.button === 0) {
        this.handleClear(event);
      }
      else {
        this.handleFlag(event);
      }
    };

    proto.handleFlag = function(event) {
      this._flag = !this._flag;

      if (this._flag) {
        this._tileRect.graphics
        .f('blue')
        .r(0, 0, 40, 40);
      }
      else if (this.mine){
        this._tileRect.graphics
        .f('red')
        .r(0, 0, 40, 40);
      }
      else {
        this._tileRect.graphics
        .f('#d8d8d8')
        .r(0, 0, 40, 40);
      }

      this.stage.update();

      event.preventDefault();
    };

    proto.handleClear = function(event) {

      if (this.open) {
        return;
      }

      if (this.mine) {
        this.gameManager.hitMine();
      }
      else if (this.totalNebMines > 0) {
        this.gameManager.openTile(this);
      }
      else {
        this.gameManager.openTilePropagating(this);
      }

      event.preventDefault();
    };

    proto._printNebs = function () {
      console.log('' + this.tileId);

      var nbString = '';
      nbString += (this.nebs.top)? 'nbTop: ' + this.nebs.top.tileId : 'nbTop: null';
      nbString += (this.nebs.right)? ' nbRight: ' + this.nebs.right.tileId : ' nbRight: null';
      nbString += (this.nebs.bottom)? ' nbBottom: ' + this.nebs.bottom.tileId : ' nbBottom: null';
      nbString += (this.nebs.left)? ' nbLeft: ' + this.nebs.left.tileId : ' nbLeft: null';
      // nbString += (this.nebs.left)? ' nbLeft: ' + this.nebs.left.tileId : ' nbLeft: null';
      console.log(nbString);
      console.log();
    };

    // The game manager.
    function Minesweep (containerId, configs) {

      /*
                PRIVATE VARIABLES
       */

      this._containerId = containerId;
      this._configs = configs;
      this._pixelRatio = window.devicePixelRatio || 1;
      this._tileWidth = this._configs.tileWidth * this._pixelRatio;
      this._tileHeight = this._configs.tileHeight * this._pixelRatio;

      var dimensions = 20 * this._pixelRatio;
      this._topOffset = dimensions;
      this._leftOffset = dimensions;

      this._stageWidth = 0;
      this._stageHeight = 0;

      this._canvasNode = null;
      this._containerNode = null;

      this._stage = null;

      this._tiles = [];
      this._mineTiles = [];
      this._openTiles = [];

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

      this._canvasNode.addEventListener('contextmenu', function (e) {
        e.preventDefault();
      });

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
      var neb;
      var hasTop;
      var hasLeft;
      for (i = 0; i < rows; ++i) {

        rowY = i * this._tileHeight;

        for (j = 0; j < cols; ++j) {
          tile = new Tile('' + counter);
          tile.setupView(this._stage, (j * this._tileWidth), rowY, this._tileWidth, this._tileHeight);
          tile.gameManager = this;
          this._tiles.push(tile);

          // Set left neighbor.
          if (counter > 0 && counter % cols > 0) {
            neb = this._tiles[counter-1];
            tile.nebs.left = neb;
            neb.nebs.right = tile;
            hasLeft = true;
            // tile.nbLeft = neb;
            // neb.nbRight = tile;
          }
          else {
            hasLeft = false;
          }

          // Set top neighbor.
          if (counter >= cols) {
            neb = this._tiles[counter-cols];
            tile.nebs.top = neb;
            neb.nebs.bottom = tile;
            hasTop = true;
            // tile.nbTop = this._tiles[counter-cols];
            // neb.nbBottom = tile;
          }
          else {
            hasTop = false;
          }

          // Set top left neighbor.
          if (hasLeft && hasTop) {
            neb = this._tiles[counter-cols-1];
            tile.nebs.topLeft = neb;
            neb.nebs.bottomRight = tile;
          }

          // Set top right neighbor.
          if (counter >= cols && (counter + 1) % cols !== 0) {
            neb = this._tiles[counter-cols+1];
            tile.nebs.topRight = neb;
            neb.nebs.bottomLeft = tile;
          }

          counter++;
        }

        j = 0;
      }


      // All tiles have been initialized and setup - allocate mines
      var availItems = this._tiles.slice();
      var key;
      var tileNebs;
      var otherTile;
      for (i = 0; i < this._configs.mines; ++ i) {

        // Get a random index from the array.
        var randomIndex = Math.floor(Math.random() * availItems.length);
        tile = availItems[randomIndex];
        tile.mine = true;
        this._mineTiles.push(tile);
        tileNebs = tile.nebs;

        for (key in tileNebs) {
          if (tileNebs.hasOwnProperty(key) && tileNebs[key]) {
            tileNebs[key].totalNebMines++;
          }
        }

        // if (tileNebs.top) {
        //   tileNebs.top.nebMineCount.bottom++;
        // }

        // if (tileNebs.right) {
        //   tileNebs.right.nebMineCount.left++;
        // }

        // if (tileNebs.bottom) {
        //   tileNebs.bottom.nebMineCount.top++;
        // }

        // if (tileNebs.left) {
        //   tileNebs.left.nebMineCount.right++;
        // }

        // Remove the item from the array.
        availItems.splice(randomIndex, 1);

        // todo: remove me.
        tile._tileRect.graphics.f('red').r(0, 0, this._tileWidth, this._tileHeight);
      }


      availItems = null;

      // todo: remove me.
      for (i = 0; i < this._tiles.length; ++i) {
        var testItem = this._tiles[i];
        testItem._printNebs();
        // testItem.showMineCount();
      }

    };

    proto.hitMine = function () {
      var i;
      var arrLength = this._mineTiles.length;
      var tile;
      for (i = 0; i < arrLength; ++i) {
        tile = this._mineTiles[i];
        tile.showMines();
      }

      this._stage.update();

      window.alert('Game over');
    };

    proto.openTilePropagating = function (tile) {
      var propogatingTiles = {};

      var key;
      var tileNebs = tile.nebs;
      var neb;
      for (key in tileNebs) {
        if (tileNebs.hasOwnProperty(key) && tileNebs[key]) {
          neb = tileNebs[key];
          if (neb.nebMineCount === 0) {
            propogatingTiles[neb.tileId] = neb;
          }
          else {
            neb.showMineCount();
          }
        }
      }

      this._stage.update();

    };

    proto.openTile = function (tile) {
      tile.showMineCount();
      tile.open = true;

      this._openTiles.push(tile);
      this._stage.update();
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
