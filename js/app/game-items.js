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

      // this.nebMineCount = {
      //   'top': 0,
      //   'right': 0,
      //   'bottom': 0,
      //   'left': 0
      // };

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

    proto.showOpen = function () {
      if (this.totalNebMines !== 0) {
        return;
      }
      var bounds = this._container.getBounds();
      this._tileRect.graphics
      .f('green')
      .r(0, 0, bounds.width, bounds.height);
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
        this.gameManager.openTileUpdating(this);
      }
      else {
        this.gameManager.openTilePropagatingUpdating(this);
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

      // Sanity check.
      if (this._configs.mines >= counter) {
        window.alert('too many mines!');
      }

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

        // Remove the item from the array.
        availItems.splice(randomIndex, 1);

        if (this._configs.showMines) {
          tile._tileRect.graphics.f('red').r(0, 0, this._tileWidth, this._tileHeight);
        }
      }


      availItems = null;

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
      tile.open = true;
      this._openTiles.push(tile);
      tile.showOpen();


      var key;
      var tileNebs = tile.nebs;
      var neb;
      for (key in tileNebs) {
        if (tileNebs.hasOwnProperty(key) && tileNebs[key] && !tileNebs[key].open) {
          neb = tileNebs[key];
          if (neb.totalNebMines === 0) {
            propogatingTiles[neb.tileId] = neb;
          }
          else {
            this.openTile(neb);
          }
        }
      }

      for (key in propogatingTiles) {
        if (propogatingTiles.hasOwnProperty(key)) {
          this.openTilePropagating(propogatingTiles[key]);
        }
      }

    };

    proto.openTilePropagatingUpdating = function (tile) {
      this.openTilePropagating(tile);
      this._stage.update();
    };

    proto.openTile = function (tile) {
      tile.showMineCount();
      tile.open = true;
      this._openTiles.push(tile);
    };

    proto.openTileUpdating = function (tile) {
      this.openTile(tile);
      this._stage.update();
    };

    gameItems.Minesweep = Minesweep;
    return gameItems;

  });
})();
