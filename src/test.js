(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
  /**
  * Javascript dithering library
  * @author 2014 Daniele Piccone 
  * @author www.danielepiccone.com
  * */
  
  "use strict";
  
  /**
  * Process a series of img elements and make them canvas graphics
  *
  * @param selector - the selector of the elements to process
  * @param opt - the options object
  */
  
  var DitherJS = function DitherJS(selector, opt, callback) {
      var self = this;
  
      // Default
      self.opt = opt || {};
      self.opt.step = self.opt.step || 1; // works better with 1,3,5,7
      self.opt.className = self.opt.className || 'dither';
      self.opt.algorithm = self.opt.algorithm || 'ordered';
      self.opt.palette = self.opt.palette || [
          [0,0,0],
          [255,0,255],
          [0,255,255],
          [255,255,255]
      ];
  
      this.palette = self.opt.palette;
  
      /**
       * Reload src image and put draw into it
       * */
      this._refreshDither = function(el) {
          // Reload src
          // el.src = el.src + '?' + Math.random();
          el.addEventListener('load', function handler(e) {
              e.target.removeEventListener(e.type, handler);
              var start_time = Date.now();
              self._dither(el);
              console.log('Microtime: ', Date.now()-start_time);
          });
      };
  
      /**
      * This does all the dirty things
      * */
      this._dither = function(el) {
          var ditherCtx = this;
  
          // Take image size
          var h = el.clientHeight;
          var w = el.clientWidth;
  
          /**
          * Return a distance of two colors ina three dimensional space
          * @param array
          * @param array
          * @return number
          * */
          this.colorDistance = function(a,b) {
              //if (a == null) return b;
              //if (b == null) return a;
              return Math.sqrt( 
                  Math.pow( ((a[0]) - (b[0])),2 )
                  + Math.pow( ((a[1]) - (b[1])),2 ) 
                  + Math.pow( ((a[2]) - (b[2])),2 )
              );
          };
  
          /**
          * Return the most closer color vs a common palette
          * @param array - the color
          * @return i - the index of the coloser color
          * */
          this.approximateColor = function(color) {
              var palette = self.opt.palette;
              var findIndex = function(fun,arg,list,min) {
                  if (list.length == 2) {
                      if (fun(arg,min) <= fun(arg,list[1])) {
                          return min;
                      }else {
                          return list[1];
                      }
                  } else {
                      //var hd = list[0];
                      var tl = list.slice(1);
                      if (fun(arg,min) <= fun(arg,list[1])) {
                          min = min; 
                      } else {
                          min = list[1];
                      }
                      return findIndex(fun,arg,tl,min);
                  }
              };
              var found_color = findIndex(ditherCtx.colorDistance,color,palette,palette[0]);
              return found_color;
          }
  
          /**
          * Threshold function
          * */
          var threshold = function(value) {
              var result = value < 127 ? 0 : 255;
              return result;            
          };
  
          /**
          * Given an image element substitute it with a canvas
          * and return the context
          * @param node - the image element
          * @return context - drawing context
          * */
          this.getContext = function(el) {
              var canvas = document.createElement('canvas');
              // this can influence the quality of the acquistion
              canvas.height = el.clientHeight;
              canvas.width = el.clientWidth;
              el.parentNode.replaceChild(canvas,el);
  
              // Inherit classes
              canvas.className = el.className;
              canvas.className = canvas.className.replace(self.opt.className,'dithered');
              // Inherit Styles
  
              // Turn it off
              // canvas.style.visibility = "hidden";
  
              // Get the context
              var ctx = canvas.getContext('2d');
              ctx.imageSmoothingEnabled = false;
              return ctx;    
          }
  
          /**
          * Perform an ordered dither on the image
          * */
          this.orderedDither = function(in_imgdata) {
              // Create a new empty image
              var out_imgdata = ctx.createImageData(in_imgdata);
              var d = new Uint8ClampedArray(in_imgdata.data);
              // Step
              var step = self.opt.step;
              // Ratio >=1
              var ratio = 3;
              // Threshold Matrix
              var m = new Array(
                  [  1,  9,  3, 11 ],
                  [ 13,  5, 15,  7 ],
                  [  4, 12,  2, 10 ],
                  [ 16,  8, 14,  6 ]
              );
  
              for (var y=0;y<h;y += step) {
                  for (var x=0;x<w;x += step) {
                      var i = (4*x) + (4*y*w);
  
                      // Define bytes
                      var r = i;
                      var g = i+1;
                      var b = i+2;
                      var a = i+3;
  
                      d[r] += m[x%4][y%4] * ratio; 
                      d[g] += m[x%4][y%4] * ratio; 
                      d[b] += m[x%4][y%4] * ratio; 
  
                      //var tr = threshold(d[r]);
                      //var tg = threshold(d[g]);
                      //var tb = threshold(d[b]);
                      var color = new Array(d[r],d[g],d[b]); 
                      var approx = ditherCtx.approximateColor(color);
                      var tr = approx[0];
                      var tg = approx[1];
                      var tb = approx[2];
  
                      // d[r] = t;
                      // d[g] = t;
                      // d[b] = t;
  
                      // Draw a block
                      for (var dx=0;dx<step;dx++){
                          for (var dy=0;dy<step;dy++){
                              var di = i + (4 * dx) + (4 * w * dy);
  
                              // Draw pixel
                              d[di] = tr;
                              d[di+1] = tg;
                              d[di+2] = tb;
  
                          }
                      }
                  }
              }
              out_imgdata.data.set(d);
              return out_imgdata;
          };
  
          /**
          * Perform an atkinson dither on the image
          * */
          this.atkinsonDither = function(in_imgdata) {
              // Create a new empty image
              var out_imgdata = ctx.createImageData(in_imgdata);
              var d = new Uint8ClampedArray(in_imgdata.data);
              var out = new Uint8ClampedArray(in_imgdata.data);
              // Step
              var step = self.opt.step;
              // Ratio >=1
              var ratio = 1/8;
  
              for (var y=0;y<h;y += step) {
                  for (var x=0;x<w;x += step) {
                      var i = (4*x) + (4*y*w);
                      
                      var $i = function(x,y) {
                          return (4*x) + (4*y*w);
                      };
  
                      // Define bytes
                      var r = i;
                      var g = i+1;
                      var b = i+2;
                      var a = i+3;
  
                      var color = new Array(d[r],d[g],d[b]); 
                      var approx = ditherCtx.approximateColor(color);
                      
                      var q = [];
                      q[r] = d[r] - approx[0];
                      q[g] = d[g] - approx[1];
                      q[b] = d[b] - approx[2];
                                       
                      // Diffuse the error for three colors
                      d[$i(x+step,y) + 0] += ratio * q[r];
                      d[$i(x-step,y+step) + 0] += ratio * q[r];
                      d[$i(x,y+step) + 0] += ratio * q[r];
                      d[$i(x+step,y+step) + 0] += ratio * q[r];
                      d[$i(x+(2*step),y) + 0] += ratio * q[r];
                      d[$i(x,y+(2*step)) + 0] += ratio * q[r];
  
                      d[$i(x+step,y) + 1] += ratio * q[r];
                      d[$i(x-step,y+step) + 1] += ratio * q[r];
                      d[$i(x,y+step) + 1] += ratio * q[r];
                      d[$i(x+step,y+step) + 1] += ratio * q[r];
                      d[$i(x+(2*step),y) + 1] += ratio * q[r];
                      d[$i(x,y+(2*step)) + 1] += ratio * q[r];
                      
                      d[$i(x+step,y) + 2] += ratio * q[r];
                      d[$i(x-step,y+step) + 2] += ratio * q[r];
                      d[$i(x,y+step) + 2] += ratio * q[r];
                      d[$i(x+step,y+step) + 2] += ratio * q[r];
                      d[$i(x+(2*step),y) + 2] += ratio * q[r];
                      d[$i(x,y+(2*step)) + 2] += ratio * q[r];
                      
                      var tr = approx[0];
                      var tg = approx[1];
                      var tb = approx[2];
  
                      // Draw a block
                      for (var dx=0;dx<step;dx++){
                          for (var dy=0;dy<step;dy++){
                              var di = i + (4 * dx) + (4 * w * dy);
  
                              // Draw pixel
                              out[di] = tr;
                              out[di+1] = tg;
                              out[di+2] = tb;
  
                          }
                      }
                  }
              }
              out_imgdata.data.set(out);
              return out_imgdata;
          };
          /**
          * Perform an error diffusion dither on the image
          * */
          this.errorDiffusionDither = function(in_imgdata) {
              // Create a new empty image
              var out_imgdata = ctx.createImageData(in_imgdata);
              var d = new Uint8ClampedArray(in_imgdata.data);
              var out = new Uint8ClampedArray(in_imgdata.data);
              // Step
              var step = self.opt.step;
              // Ratio >=1
              var ratio = 1/16;
              // Threshold Matrix
              var m = new Array(
                  [  1,  9,  3, 11 ],
                  [ 13,  5, 15,  7 ],
                  [  4, 12,  2, 10 ],
                  [ 16,  8, 14,  6 ]
              );
  
              for (var y=0;y<h;y += step) {
                  for (var x=0;x<w;x += step) {
                      var i = (4*x) + (4*y*w);
                      
                      var $i = function(x,y) {
                          return (4*x) + (4*y*w);
                      };
  
                      // Define bytes
                      var r = i;
                      var g = i+1;
                      var b = i+2;
                      var a = i+3;
  
                      var color = new Array(d[r],d[g],d[b]); 
                      var approx = ditherCtx.approximateColor(color);
                      
                      var q = [];
                      q[r] = d[r] - approx[0];
                      q[g] = d[g] - approx[1];
                      q[b] = d[b] - approx[2];
                                       
                      // Diffuse the error
                      d[$i(x+step,y)] =  d[$i(x+step,y)] + 7 * ratio * q[r];
                      d[$i(x-step,y+1)] =  d[$i(x-1,y+step)] + 3 * ratio * q[r];
                      d[$i(x,y+step)] =  d[$i(x,y+step)] + 5 * ratio * q[r];
                      d[$i(x+step,y+step)] =  d[$i(x+1,y+step)] + 1 * ratio * q[r];
  
                      d[$i(x+step,y)+1] =  d[$i(x+step,y)+1] + 7 * ratio * q[g];
                      d[$i(x-step,y+step)+1] =  d[$i(x-step,y+step)+1] + 3 * ratio * q[g];
                      d[$i(x,y+step)+1] =  d[$i(x,y+step)+1] + 5 * ratio * q[g];
                      d[$i(x+step,y+step)+1] =  d[$i(x+step,y+step)+1] + 1 * ratio * q[g];
  
                      d[$i(x+step,y)+2] =  d[$i(x+step,y)+2] + 7 * ratio * q[b];
                      d[$i(x-step,y+step)+2] =  d[$i(x-step,y+step)+2] + 3 * ratio * q[b];
                      d[$i(x,y+step)+2] =  d[$i(x,y+step)+2] + 5 * ratio * q[b];
                      d[$i(x+step,y+step)+2] =  d[$i(x+step,y+step)+2] + 1 * ratio * q[b];
  
                      // Color
                      var tr = approx[0];
                      var tg = approx[1];
                      var tb = approx[2];
  
                      // Draw a block
                      for (var dx=0;dx<step;dx++){
                          for (var dy=0;dy<step;dy++){
                              var di = i + (4 * dx) + (4 * w * dy);
  
                              // Draw pixel
                              out[di] = tr;
                              out[di+1] = tg;
                              out[di+2] = tb;
  
                          }
                      }
                  }
              }
              out_imgdata.data.set(out);
              return out_imgdata;
          };
  
          var ctx = this.getContext(el);
  
          // Put the picture in
          ctx.drawImage(el,0,0,w,h);
  
          // Pick image data
          var in_image = ctx.getImageData(0,0,w,h);
  
          //var out_image = ditherCtx.orderedDither(in_image);
          if (self.opt.algorithm == 'errorDiffusion')
              var out_image = ditherCtx.errorDiffusionDither(in_image);
          else if (self.opt.algorithm == 'ordered')
              var out_image = ditherCtx.orderedDither(in_image);
          else if (self.opt.algorithm == 'atkinson')
              var out_image = ditherCtx.atkinsonDither(in_image);
          else
              throw new Error('Not a valid algorithm');
  
          // Put image data
          ctx.putImageData(out_image,0,0);
  
          // Turn it on
          //canvas.style.visibility = "visible";
  
          console.log('Dithering completed (', self.opt.className, ':', ctx.canvas, ')');
          callback();
      }
  
  
      /**
      * Main
      * */
      try {
          var elements = document.querySelectorAll(selector);
  
          //  deal with multiple
          for (var i=0;i<elements.length;i++) {
              this._refreshDither(elements[i]);
          } 
  
      } catch (e) {
          // Officially not in the browser
      }
  
  };
  
  /**
  * Register AMD module
  * */
  if (typeof define === 'function' && define.amd) {
      define('ditherjs', function(){
          // This function is expected to instantiate the module
          // in this case returns the constructor
          return DitherJS;
      });
  };
  
  /**
  * Export class for node 
  * */
  if (typeof module === "object" && module.exports) {
      module.exports = DitherJS;
  }
  
  },{}],2:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global module */
  
  function Brick(dimension, color) {
    var self = this;
    self.dimension = dimension;
    self.color = color;
  }
  
  Brick.prototype.toString = function() {
    return this.dimension + ', ' + this.color.id;
  };
  
  module.exports = Brick;
  
  },{}],3:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global $, require, module */
  
  var DitherJS = require('../../lib/ditherjs');
  var Globals = require('./globals');
  var Brick = require('./brick');
  
  function Bricker(original_image, num_vertical_blocks, colors, selected_colors, stack_mode, size_callback) {
    var self = this;
    var kColors = colors;
    var kOrigImage = $(original_image);
    var kScratchCanvas = $('#bricker-scratch-canvas');
    var kScratchImg = $('#bricker-scratch-img');
    var kStackMode = stack_mode;
    var kTmpPrefix = 'tmp-image-';
    var kCallback = size_callback;
  
    self.numVerticalBlocks = num_vertical_blocks;
    self.palette = kColors.getPalette(selected_colors);
    self.cachedResults = {};
  
    var _returnSize = function(canvas) {
      kCallback({
        width: canvas.width / Globals.blockSize,
        height: canvas.height / Globals.blockSize
      });
    };
  
    var _cropImage = function() {
      var src_width = kOrigImage[0].naturalWidth;
      var src_height = kOrigImage[0].naturalHeight;
  
      var new_height = self.numVerticalBlocks * Globals.blockSize;
      var compression = kStackMode ? 1/Globals.blockAspectRatio : 1;
      var new_width = Math.floor((src_width / (src_height * compression)) * (self.numVerticalBlocks)) * Globals.blockSize;
  
      var canvas = kScratchCanvas[0];
      var context = canvas.getContext('2d');
      canvas.width = new_width;
      canvas.height = new_height;
      _returnSize(canvas);
  
      // Force fill background white to support images with transparency
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, new_width, new_height);
  
      // Seems to work better with some arbitrary offsets... Not sure if it's problem with DitherJS
      var offset = 0;
      // var offset = 0;
      context.drawImage(kOrigImage[0], offset, offset, src_width, src_height, 0, 0, new_width, new_height);
  
      // Not sure if there's a race condition here
      kScratchImg[0].src = canvas.toDataURL('image/png');
    };
  
    var _cloneImage = function() {
      var display_box = $('<div></div>');
      display_box.appendTo(kOrigImage.parent());
  
      display_box.addClass(_getSizeKey());
      display_box.addClass(Globals.displayBoxClass);
      display_box.addClass('bricker-display-box-active');
  
      _cropImage();
  
      var tmp = kScratchImg.clone();
      tmp.removeAttr('id');
      tmp.addClass(Globals.displayBoxImageClass);
  
      // Background comparison image
      tmp.clone().appendTo(display_box);
  
      tmp.addClass(kTmpPrefix + _getSizeKey());
      tmp.appendTo(display_box);
  
      return display_box;
    };
  
    var _resetZoom = function(display_box) {
      var canvas = $('canvas', display_box);
      var img = $('img', display_box);
  
      if (kStackMode) {
        var width = canvas.width();
        canvas.width(width);
        canvas.height(canvas.height() * Globals.blockAspectRatio);
        img.width(width);
        img.height(img.height() * Globals.blockAspectRatio);
      }
  
      if (canvas.width() <= kOrigImage.width()) {
        return;
      }
  
      var new_width = kOrigImage.width();
      var new_height = canvas.height() / canvas.width() * new_width;
      canvas.width(new_width);
      canvas.height(new_height);
      img.width(new_width);
      img.height(new_height);
    };
  
    var _getSizeKey = function() {
      return "bricker-size-" + self.numVerticalBlocks;
    };
  
    var _getCurrentBox = function() {
      return self.cachedResults[_getSizeKey()];
    };
  
    self.ditherImage = function(callback) {
      setTimeout(function() {
        var display_box = _cloneImage();
        self.cachedResults[_getSizeKey()] = display_box;
  
        var options = {
            'step': Globals.blockSize,
            'className': kTmpPrefix + _getSizeKey(),
            'palette': self.palette,
            'algorithm': 'ordered'
        };
  
        display_box.css("visibility", "hidden");
        new DitherJS('.' + kTmpPrefix + _getSizeKey(), options, function() {
          display_box.css("visibility", "visible");
          _resetZoom(display_box);
          if (callback) {
            callback();
          }
        });
      }, 1);
    };
  
    self.changeSize = function(num_vertical_blocks, callback) {
      var box = _getCurrentBox();
      if (box) {
        box.hide();
        box.removeClass('bricker-display-box-active');
      }
      self.numVerticalBlocks = num_vertical_blocks;
  
      if (_getSizeKey() in self.cachedResults) {
        box = _getCurrentBox();
        box.show();
        box.addClass('bricker-display-box-active');
        _returnSize($('canvas', box)[0]);
        if (callback) {
          callback();
        }
        return true;
      } else {
        self.ditherImage(callback);
        return false;
      }
    };
  
    self.destroy = function() {
      $(Globals.displayBoxSelector).remove();
    };
  
  
  
  // Build instructions
  //=================================================================================================
    var _getColorMatrix = function(box) {
      var canvas = $('canvas', box)[0];
      var width = canvas.width;
      var height = canvas.height;
      var data = canvas.getContext('2d').getImageData(0, 0, width, height).data;
  
      var color_matrix = [];
      for (var y = 0; y < height; y += Globals.blockSize) {
        var row = [];
        for (var x = 0; x < width; x += Globals.blockSize) {
          var index = (y * width + x) * 4;
          var rgba = 'rgba(' + data[index] + ',' + data[index+1] + ',' + data[index+2] + ',1.0)';
          var color = kColors.getColorFromRGBA(rgba);
          row.push(color);
        }
        color_matrix.push(row);
      }
      return color_matrix;
    };
  
    var _fitBricksInChunk = function(brick_types, num_blocks, color, brick_counts) {
      var chunk = [];
      var n = 0;
      for (var i = 0; i < brick_types.length; i++) {
        var brick = new Brick(brick_types[i], color);
        while (brick.dimension <= num_blocks) {
          if (n++ % 2 === 0) {
            chunk.unshift(brick);
          } else {
            chunk.push(brick);
          }
  
          if (!(brick in brick_counts.individual)) {
            brick_counts.individual[brick] = 0;
          }
          if (brick_counts.brick_colors.indexOf(color.id) === -1) {
            brick_counts.brick_colors.push(color.id);
          }
          brick_counts.individual[brick]++;
          brick_counts.total++;
          num_blocks -= brick.dimension;
        }
      }
      return chunk;
    };
  
    // Probably needs more arguments for valid block sizes and stack mode
    self.generateInstructions = function(brick_types) {
      if (!brick_types) {
        brick_types = [8, 4, 2, 1];
      }
  
      var box = _getCurrentBox();
      if (!box) {
        console.error("Failed to generate instructions");
        return;
      }
  
      var color_matrix = _getColorMatrix(box);
      var brick_matrix = [];
      var brick_counts = {
        total: 0,
        individual: {},
        brick_types: brick_types,
        brick_colors: []
      };
  
      for (var i = 0; i < color_matrix.length; i++) {
        var bricks = [];
        var row = color_matrix[i];
  
        var j = 0;
        while (j < row.length) {
          var start = j;
          var current_color = row[j];
  
          while (j < row.length && row[j].id === current_color.id) {
            j++;
          }
  
          var num_blocks = j - start;
          var chunk = _fitBricksInChunk(brick_types, num_blocks, current_color, brick_counts);
          bricks = bricks.concat(chunk);
        }
        brick_matrix.push(bricks);
      }
      console.log("Number of bricks: ", brick_counts.total);
      brick_counts.brick_colors.sort(function(a, b) { return a-b; });
      brick_counts.brick_types.sort(function(a, b) { return b-a; });
      return { bricks: brick_matrix, brickCounts: brick_counts };
    };
  }
  
  module.exports = Bricker;
  
  },{"../../lib/ditherjs":1,"./brick":2,"./globals":12}],4:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  /* global module */
  
  function Color(headers, line) {
    var self = this;
  
    for (var i = 0; i < headers.length; i++) {
      var val = line[i];
      if (headers[i] !== 'name') {
        val = parseInt(val);
      }
      self[headers[i].toLowerCase()] = val;
    }
    line = null;
  
    self.getRGBString = function() {
      return 'rgba(' + self.r + ',' + self.g + ',' + self.b + ',1.0)';
    };
  
    self.getRGB = function() {
      return [self.r, self.g, self.b];
    };
  
    self.isDefault = function() {
      return self.show_as_default === 1;
    };
  
    self.isTransparent = function() {
      return self.transparent === 1;
    };
  
    self.isDark = function() {
      return self.r * 0.299 + self.g * 0.587 + self.b * 0.114 <= 186;
    };
  }
  
  function Colors(csv_text) {
    var self = this;
    var idMap = {};
    var rgbaMap = {};
  
    var lines = csv_text.split(/\r\n|\n/);
    self.headers = lines[0].split(',');
    self.rows = [];
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i].split(',');
      var color = new Color(self.headers, line);
      self.rows.push(color);
      idMap[color.id] = color;
      rgbaMap[color.getRGBString()] = color;
    }
    lines = null;
  
    self.getDefaultIDs = function() {
      var ids = [];
      for (var i = 0; i < self.rows.length; i++) {
        var color = self.rows[i];
        if (color.isDefault()) {
          ids.push(color.id);
        }
      }
      return ids;
    };
  
    self.getPalette = function(ids) {
      var palette = [];
      for (var i = 0; i < self.rows.length; i++) {
        var color = self.rows[i];
        if (ids.indexOf(color.id) !== -1) {
          palette.push(color.getRGB());
        }
      }
      return palette;
    };
  
    self.getColorFromRGBA = function(rgba) {
      return rgbaMap[rgba];
    };
  
    self.getColorFromID = function(id) {
      return idMap[id];
    };
  }
  
  module.exports = Colors;
  
  },{}],5:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global require, module, React */
  
  var Globals = require('../globals');
  
  var BrickPicker = React.createClass({displayName: "BrickPicker",
    getInitialState: function() {
      return {
        changed: false,
        selectedBrickTypes: this.props.selectedBrickTypes
      };
    },
    onClickSave: function() {
      this.props.data.handleUpdateSelectedBricks(this.state.selectedBrickTypes);
      this.setState({ changed: false });
      console.log("test");
    },
    onClick: function(event) {
      var brick_type = parseInt(event.currentTarget.value);
      var selected_types = this.state.selectedBrickTypes;
      var index = selected_types.indexOf(brick_type);
      if (index === -1) {
        selected_types.push(brick_type);
      } else {
        selected_types.splice(index, 1);
      }
      this.setState({ selectedBrickTypes: selected_types, changed: true });
    },
    render: function() {
      var self = this;
      var brickNodes = Globals.allBrickTypes.map(function(brick_type) {
        if (brick_type === 1) {
          return null;
        }
        var selected = self.state.selectedBrickTypes.indexOf(brick_type) !== -1;
        var class_name = selected ? 'btn btn-custom active' : 'btn btn-custom';
        return (
          React.createElement("button", {type: "button", key: brick_type, className: class_name, value: brick_type, onClick: self.onClick}, 
            "1 x ", brick_type
          )
        );
      });
  
      var button_class = this.state.changed ? "btn btn-primary" : "btn btn-primary disabled";
  
      return (
        React.createElement("div", {className: "toolbar-section"}, 
          React.createElement("div", {className: "toolbar-label"}, "Bricks"), 
          React.createElement("div", {className: "toolbar-content"}, 
            React.createElement("div", {className: "toolbar-brick-list"}, 
              brickNodes, 
              React.createElement("button", {type: "button", className: "btn btn-custom active", title: "1x1 bricks must always be selected"}, 
                "1 x 1"
              )
            ), 
            React.createElement("div", {className: "toolbar-save"}, 
              React.createElement("button", {className: button_class, onClick: this.onClickSave}, "Save Bricks")
            )
          )
        )
      );
    }
  });
  
  module.exports = BrickPicker;
  
  },{"../globals":12}],6:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global module, React */
  
  var ColorEntry = React.createClass({displayName: "ColorEntry",
    toggle: function() {
      this.props.data.reportChanged();
      if (this.props.isSelected) {
        this.props.data.handleRemoveFromPalette(this.props.color.id);
      } else {
        this.props.data.handleAddToPalette(this.props.color.id);
      }
    },
    render: function() {
      var divStyle = {
        backgroundColor: this.props.color.getRGBString()
      };
      var class_name = "toolbar-color-entry";
      if (this.props.isSelected) {
        class_name += " toolbar-color-entry-selected";
      }
      return (
        React.createElement("div", {className: class_name, 
             onClick: this.toggle, 
             style: divStyle, 
             title: this.props.color.name}
        )
      );
    }
  });
  
  var ColorPicker = React.createClass({displayName: "ColorPicker",
    getInitialState: function() {
      return {
        changed: false
      };
    },
    selectedEntries: function() {
      var selected_colors = this.props.selectedColors;
      return this.props.colors.filter(function(color) {
        return selected_colors.indexOf(color.id) !== -1;
      }).map(this.mapEntries);
    },
    unselectedTransparentEntries: function() {
      var selected_colors = this.props.selectedColors;
      return this.props.colors.filter(function(color) {
        return color.isTransparent() && selected_colors.indexOf(color.id) === -1;
      }).map(this.mapEntries);
    },
    unselectedNormalEntries: function() {
      var selected_colors = this.props.selectedColors;
      return this.props.colors.filter(function(color) {
        return !color.isTransparent() && selected_colors.indexOf(color.id) === -1;
      }).map(this.mapEntries);
    },
    mapEntries: function(color) {
      var self = this;
      var selected = this.props.selectedColors.indexOf(color.id) !== -1;
      var data = this.props.data;
      data.reportChanged = function() {
        self.setState({ changed: true });
      };
      return (
        React.createElement(ColorEntry, {key: color.id, color: color, isSelected: selected, data: data})
      );
    },
    onClick: function() {
      this.props.data.handleReset();
      this.setState({ changed: false });
    },
    render: function() {
      var button_class = this.state.changed ? "btn btn-primary" : "btn btn-primary disabled";
      return (
        React.createElement("div", {className: "toolbar-section"}, 
          React.createElement("div", {className: "toolbar-label"}, "Colors"), 
          React.createElement("div", {className: "toolbar-content"}, 
            React.createElement("div", {className: "toolbar-color-list"}, 
              this.selectedEntries(), 
              React.createElement("br", null), 
              this.unselectedNormalEntries()
            ), 
            React.createElement("div", {className: "toolbar-save"}, 
              React.createElement("button", {className: button_class, onClick: this.onClick}, "Save Colors")
            )
          )
        )
      );
    }
  });
  
  module.exports = ColorPicker;
  
  },{}],7:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global $, module, React */
  
  var Instruction = React.createClass({displayName: "Instruction",
    getInitialState: function() {
      return {
        imgurURL: null
      };
    },
    _getImageURL: function() {
      var active = $('.bricker-display-box-active');
      var canvas = $('canvas', active);
      return canvas.get(0).toDataURL('image/png');
    },
    scrollToInstructions: function() {
      $('body,html').animate({
        scrollTop: $('#instructions').offset().top
      }, 400);
    },
    saveImage: function(event) {
      event.currentTarget.href = this._getImageURL();
    },
    uploadImage: function() {
      if (this.state.imgurURL) {
        window.open(this.state.imgurURL, '_blank');
        return;
      }
      var self = this;
      var img = this._getImageURL().split(',')[1];
  
      $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'post',
        headers: {
          Authorization: 'Client-ID 3477476ed556a0b'
        },
        data: {
          image: img
        },
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            var url = 'http://imgur.com/' + response.data.id;
            self.setState({ imgurURL: url });
            window.location = url;
          }
        }
      });
    },
    render: function() {
      var class_name = 'btn btn-default';
      if (!this.props.data.ready) {
        class_name += ' disabled';
      }
  
      if (!this.props.instructions) {
        return null;
      }
  
      return (
        React.createElement("div", {className: "toolbar-section"}, 
          React.createElement("div", {className: "toolbar-label"}, "Result"), 
          React.createElement("div", {className: "toolbar-content"}, 
            React.createElement("div", {className: "btn-toolbar"}, 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("button", {type: "button", className: "btn btn-primary btn-lg", onClick: this.scrollToInstructions}, 
                  "Build"
                )
              ), 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("a", {type: "button", className: "btn btn-custom btn-lg", onClick: this.saveImage, download: "bricks.png"}, 
                  "Save"
                )
              ), 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("button", {type: "button", className: "btn btn-custom btn-lg", onClick: this.uploadImage, title: "Upload to Imgur to share with others"}, 
                  "Share"
                )
              )
            )
          ), 
          React.createElement("div", {className: "toolbar-footer"}, 
              "Design requires ", React.createElement("strong", null, this.props.instructions.brickCounts.total), " bricks"
          )
        )
      );
    }
  });
  
  module.exports = Instruction;
  
  },{}],8:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global $, require, module, React */
  
  var Globals = require('../globals');
  
  var Options = React.createClass({displayName: "Options",
    getInitialState: function() {
      return {
        stackMode: this.props.stackMode,
        changed: false,
        height: this.props.defaultHeight,
        useMetric: true
      };
    },
    _toFeet: function(x) {
      var realFeet = ((x*0.393700) / 12);
      var feet = Math.floor(realFeet);
      var inches = Math.round((realFeet - feet) * 12);
      return feet + '\u2032 ' + inches + '\u2033';
    },
    _getHeight: function() {
      if (this.props.stackMode) {
        return this.props.dimension.height * Globals.blockRealHeight / 10;
      } else {
        return this.props.dimension.height * Globals.blockRealWidth / 10;
      }
    },
    _getWidth: function() {
      return this.props.dimension.width * Globals.blockRealWidth / 10;
    },
    _printDimensions: function() {
      if (this.state.useMetric) {
        return this._getWidth().toFixed(1) + 'cm x ' + this._getHeight().toFixed(1) + 'cm';
      } else {
        return this._toFeet(this._getWidth()) + ' x ' + this._toFeet(this._getHeight());
      }
    },
    onChange: function(event) {
      var height = event.target.value;
      this.setState({ height: height, changed: true });
    },
    onClickSave: function() {
      this.props.data.handleUpdateHeight(this.state.height, this.state.stackMode);
      this.setState({ changed: false });
    },
    onFocus: function(event) {
      $(event.currentTarget).select();
    },
    onChangeStackMode: function() {
      this.setState({ stackMode: !this.state.stackMode, changed: true });
    },
    onChangeUseMetric: function() {
      this.setState({ useMetric: !this.state.useMetric });
    },
    componentWillReceiveProps: function(props) {
      this.setState({ height: props.defaultHeight, changed: false });
    },
    render: function() {
      var button_class = this.state.changed ? "btn btn-primary" : "btn btn-primary disabled";
  
      return (
        React.createElement("div", {className: "toolbar-section"}, 
          React.createElement("div", {className: "toolbar-label"}, "Options"), 
          React.createElement("div", {className: "toolbar-content"}, 
            React.createElement("table", {className: "toolbar-options"}, 
              React.createElement("tbody", null, 
                React.createElement("tr", null, 
                  React.createElement("th", null, "Height in Blocks"), 
                  React.createElement("td", null, 
                    React.createElement("input", {type: "text", className: "btn-custom", value: this.state.height, onClick: this.onFocus, onChange: this.onChange})
                  )
                ), 
                React.createElement("tr", {title: "Choose between top down or stacking bricks"}, 
                  React.createElement("th", null, "Stack Bricks"), 
                  React.createElement("td", null, 
                    React.createElement("input", {type: "checkbox", className: "btn-custom", checked: this.state.stackMode, onChange: this.onChangeStackMode})
                  )
                ), 
                React.createElement("tr", null, 
                  React.createElement("th", null, "Use Metric"), 
                  React.createElement("td", null, 
                    React.createElement("input", {type: "checkbox", className: "btn-custom", checked: this.state.useMetric, onChange: this.onChangeUseMetric})
                  )
                )
              )
            ), 
  
            React.createElement("div", {className: "toolbar-save"}, 
              React.createElement("button", {className: button_class, onClick: this.onClickSave}, "Save Options")
            )
          ), 
          React.createElement("div", {className: "toolbar-footer"}, 
            React.createElement("div", {className: "toolbar-dimensions"}, 
              "Design measures ", React.createElement("strong", null, this._printDimensions())
            )
          )
        )
      );
    }
  });
  
  module.exports = Options;
  
  },{"../globals":12}],9:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global $, require, module, React */
  
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
  
  var Uploader = require('./uploader');
  
  var Thumbnail = React.createClass({displayName: "Thumbnail",
    onClick: function(event) {
      var src = $(event.target).data('url').trim();
      console.log(src);
      var use_colors = this.props.thumbnail.colors;
      var dimension = this.props.thumbnail.dimension;
      this.props.data.handleChangeImage(src, use_colors, dimension);
    },
    render: function() {
      var style = {
        backgroundImage: 'url(' + this.props.thumbnail.src + ')'
      };
      return (
        React.createElement("div", {className: "bricker-thumbnail-box"}, 
          React.createElement("div", {style: style, "data-url": this.props.thumbnail.src, className: "bricker-thumbnail", title: this.props.thumbnail.title, onClick: this.onClick}), 
          React.createElement("div", {className: "bricker-thumbnail-popup"}, 
            React.createElement("img", {src: this.props.thumbnail.src, className: "bricker-thumbnail-popup-image"}), 
            React.createElement("div", {className: "bricker-thumbnail-popup-caption"}, this.props.thumbnail.title)
          )
        )
      );
    }
  });
  
  var Thumbnails = React.createClass({displayName: "Thumbnails",
    render: function() {
      var self = this;
      var thumbnailNodes = this.props.thumbnails.map(function(thumbnail) {
        return (
          React.createElement(Thumbnail, {key: thumbnail.title, thumbnail: thumbnail, data: self.props.data})
        );
      });
      return (
        React.createElement("div", {className: "toolbar-section"}, 
          React.createElement("div", {className: "toolbar-label"}, "Source Image"), 
          React.createElement("div", {className: "toolbar-content clearfix"}, 
            React.createElement(ReactCSSTransitionGroup, {transitionName: "bricker-thumbnail-transition"}, 
              thumbnailNodes
            ), 
            React.createElement("div", {className: "bricker-thumbnail-box"}, 
              React.createElement(Uploader, {data: this.props.data})
            )
          )
        )
      );
    }
  });
  
  module.exports = Thumbnails;
  
  },{"./uploader":10}],10:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global module, React */
  
  var Uploader = React.createClass({displayName: "Uploader",
    getInitialState: function() {
      return {
        uploadedFiles: []
      };
    },
    onChange: function(event) {
      var self = this;
      var file = event.target.files[0];
  
      if (this.state.uploadedFiles.indexOf(file.name) !== -1) {
        console.error("File was already uploaded");
        return;
      }
      this.state.uploadedFiles.push(file.name);
  
      var reader = new FileReader();
      reader.onloadend = function() {
        self.props.data.handleUploadedImage(reader.result, file.name);
      };
  
      if (file) {
        reader.readAsDataURL(file);
      }
    },
    render: function() {
      return (
        React.createElement("div", {className: "btn btn-custom btn-file bricker-thumbnail-upload-button", title: "Upload your own image"}, 
          "Upload", React.createElement("input", {type: "file", onChange: this.onChange})
        )
      );
    }
  });
  
  module.exports = Uploader;
  
  },{}],11:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global $, require, module, React */
  
  var Globals = require('./globals');
  
  var Diagram = React.createClass({displayName: "Diagram",
    getInitialState: function() {
      return {
        instructions: null,
        stackMode: false,
        showLabel: true,
        colors: null
      };
    },
    updateInstructions: function(instructions, stackMode, colors) {
      this.setState({
        instructions: instructions,
        stackMode: stackMode,
        colors: colors
      });
    },
    hideLabel: function() {
      this.setState({ showLabel: !this.state.showLabel });
    },
    render: function() {
      if (!this.state.colors) {
        return null;
      }
  
      var data = {
        instructions: this.state.instructions,
        stackMode: this.state.stackMode,
        showLabel: this.state.showLabel,
        handleHideLabel: this.hideLabel,
        colors: this.state.colors
      };
  
      return (
        React.createElement("div", null, 
          React.createElement("h2", {id: "instructions"}, "Build Instructions"), 
          React.createElement("div", {className: "instruction-diagram-controls row"}, 
            React.createElement("div", {className: "col-sm-4 text-right"}, 
              React.createElement(InstructionToolbar, {data: data})
            ), 
            React.createElement("div", {className: "col-sm-4"}, 
              React.createElement(InstructionTable, {data: data})
            )
  
          ), 
          React.createElement(InstructionRows, {data: data})
        )
      );
    }
  });
  
  var InstructionTable = React.createClass({displayName: "InstructionTable",
    render: function() {
      var instructions = this.props.data.instructions;
      if (instructions === null) {
        return null;
      }
  
      var self = this;
      var brick_counts = instructions.brickCounts;
  
      var headerNodes = brick_counts.brick_colors.map(function(color_id) {
        var color = self.props.data.colors.getColorFromID(color_id);
        return (
          React.createElement("th", {key: color_id}, 
            React.createElement(InstructionBrick, {data: self.props.data, color: color, dimension: 1})
          )
        );
      });
  
      var col_sums = brick_counts.brick_colors.map(function() {
        return 0;
      });
  
      var rowNodes = brick_counts.brick_types.map(function(type) {
  
        var row_sum = 0;
        var cellNodes = brick_counts.brick_colors.map(function(color_id, index) {
          var key = type + ', ' + color_id;
          var count = key in brick_counts.individual ? brick_counts.individual[key] : 0;
          row_sum += count;
          col_sums[index] += count;
          return (
            React.createElement("td", {key: key}, count)
          );
        });
  
        var color = self.props.data.colors.getColorFromID(194);
  
        return (
          React.createElement("tr", {key: type}, 
            React.createElement("th", {className: "text-right"}, React.createElement(InstructionBrick, {data: self.props.data, color: color, dimension: type})), 
            React.createElement("th", null, "1 x ", type), 
            cellNodes, 
            React.createElement("td", null, row_sum)
          )
        );
      });
  
      var sumNodes = col_sums.map(function(sum, index) {
        return (
          React.createElement("td", {key: index}, sum)
        );
      });
  
      return (
        React.createElement("table", {className: "instruction-table table table-bordered table-striped"}, 
          React.createElement("thead", null, 
            React.createElement("tr", null, 
              React.createElement("th", {colSpan: "2"}, "Brick Size"), 
              headerNodes, 
              React.createElement("th", null)
            )
          ), 
          React.createElement("tbody", null, 
            rowNodes, 
            React.createElement("tr", null, 
              React.createElement("td", {colSpan: "2"}), 
              sumNodes, 
              React.createElement("td", null, brick_counts.total)
            )
          )
        )
      );
    }
  });
  
  var InstructionToolbar = React.createClass({displayName: "InstructionToolbar",
    scrollToTop: function() {
      $('body,html').animate({
        scrollTop: $('#header').offset().top
      }, 400);
    },
    render: function() {
      var text = this.props.data.showLabel ? 'Hide Brick Labels' : 'Show Brick Labels';
      return (
        React.createElement("div", {className: "btn-toolbar", style: {display: 'inline-block'}}, 
          React.createElement("div", {className: "btn-group"}, 
            React.createElement("button", {type: "button", className: "btn btn-primary btn-lg", onClick: this.scrollToTop}, 
              "Go Back"
            )
          ), 
          React.createElement("div", {className: "btn-group"}, 
            React.createElement("button", {type: "button", className: "btn btn-custom btn-lg", onClick: this.props.data.handleHideLabel}, 
              text
            )
          )
        )
      );
    }
  });
  
  var InstructionRows = React.createClass({displayName: "InstructionRows",
    render: function() {
      var instructions = this.props.data.instructions;
      if (instructions === null) {
        return null;
      }
  
      var self = this;
      var rows = instructions.bricks;
      var rowNodes = rows.map(function(row, index) {
        var row_num = rows.length - index;
        return (
          React.createElement(InstructionRow, {key: index, 
                          rowNumber: row_num, 
                          row: row, 
                          data: self.props.data})
        );
      });
      return (
        React.createElement("div", {className: "instruction-diagram-body"}, 
          rowNodes
        )
      );
    }
  });
  
  var InstructionRow = React.createClass({displayName: "InstructionRow",
    render: function() {
      var self = this;
      var brickNodes = this.props.row.map(function(brick, index) {
        var key = brick.dimension + ',' + brick.color.id + ',' + index;
        return (
          React.createElement(InstructionBrick, {key: key, 
                            rowNum: self.props.rowNumber, 
                            num: index+1, 
                            dimension: brick.dimension, 
                            color: brick.color, 
                            data: self.props.data})
        );
      });
      var class_name = 'instruction-diagram-row';
      if (!this.props.data.showLabel) {
        class_name += ' hide-label';
      }
  
      return (
        React.createElement("div", {className: class_name}, 
          React.createElement("div", {className: "instruction-diagram-row-number instruction-diagram-label"}, this.props.rowNumber, " "), 
          brickNodes, 
          React.createElement("div", {className: "instruction-diagram-row-number instruction-diagram-label"}, this.props.rowNumber, " ")
        )
      );
    }
  });
  
  var InstructionBrick = React.createClass({displayName: "InstructionBrick",
    render: function() {
      var style = {
        backgroundColor: this.props.color.getRGBString(),
        // height: 9.6 * 2,
        width: this.props.data.stackMode ? Globals.blockRealWidth * 2 * this.props.dimension : Globals.blockRealHeight * 2 * this.props.dimension
      };
      var text_style = {
        color: this.props.color.isDark() ? '#fff' : '#000',
      };
  
      var hover_box = null;
      if (this.props.num) {
        hover_box = (
          React.createElement("div", {className: "instruction-diagram-hover"}, 
            React.createElement("strong", null, this.props.color.name), " of size ", React.createElement("strong", null, this.props.dimension), 
            React.createElement("br", null), 
            "at position ", React.createElement("strong", null, this.props.num), " of row ", React.createElement("strong", null, this.props.rowNum)
          )
        );
      } else {
        hover_box = (
          React.createElement("div", {className: "instruction-diagram-hover"}, 
            React.createElement("strong", null, this.props.color.name)
          )
        );
      }
  
      return (
        React.createElement("div", {className: "instruction-diagram-brick", style: style}, 
          React.createElement("span", {className: "instruction-diagram-label", style: text_style}, this.props.num), 
          hover_box
        )
      );
    }
  });
  
  module.exports = Diagram;
  
  },{"./globals":12}],12:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  /* global module */
  
  var Globals = {
    blockSize: 20,
    blockRealHeight: 9.6,
    blockRealWidth: 7.8,
    maxHeight: 200,
    defaultHeight: 32,
    displayBoxClass: 'bricker-display-box',
    displayBoxImageClass: 'bricker-display-box-image',
    instructionsPreviewRows: 3,
    allBrickTypes: [1],
    initialBrickTypes: [1],
    init: function() {
      this.displayBoxSelector = '.' + this.displayBoxClass;
      this.blockAspectRatio = this.blockRealHeight / this.blockRealWidth;
    }
  };
  
  Globals.init();
  
  module.exports = Globals;
  
  },{}],13:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global $, require, React */
  
  var Toolbar = require('./toolbar');
  var Diagram = require('./diagram');
  
  $(document).ready(function() {
    var thumbnails = [
      
      { src: "img/charlotte.jpg", title: "32x32, BW, Charlotte", colors: [1, 26, 194, 199], dimension: 32 },
      { src: "img/charlotte.jpg", title: "32x32, Color, Charlotte", colors: [1, 5, 21, 23, 24, 26, 28, 106, 192, 194, 199], dimension: 32 },
      { src: "img/charlotte.jpg", title: "48x48, BW, Charlotte", colors: [1, 26, 194, 199], dimension: 48 },
      { src: "img/charlotte.jpg", title: "48x48, Color, Charlotte", colors: [1, 5, 21, 23, 24, 26, 28, 106, 192, 194, 199], dimension: 48 },
      
    ];
  
    $('#about-link').on('click', function(event) {
      $('body,html').animate({
        scrollTop: $('#about').offset().top
      }, 400);
      event.preventDefault();
    });
  
    $('#back-link').on('click', function(event) {
      $('body,html').animate({
        scrollTop: $('#header').offset().top
      }, 400);
      event.preventDefault();
    });
  
    var diagram = React.render(
      React.createElement(Diagram, null),
      document.getElementById('diagram')
    );
  
    var img = $('.bricker-original');
    img.one('load', function() {
      React.render(
        React.createElement(Toolbar, {colorsURL: "csv/lego.csv", image: img, initialThumbnails: thumbnails, diagram: diagram}),
        document.getElementById('toolbar')
      );
    });
  });
  
  },{"./diagram":11,"./toolbar":14}],14:[function(require,module,exports){
  "use strict";
  /* jshint globalstrict: true */
  
  /* global $, require, module, React */
  
  var Colors = require('./colors');
  var Globals = require('./globals');
  var Bricker = require('./bricker');
  
  var Thumbnails = require('./components/thumbnails');
  var Instruction = require('./components/instruction');
  var Options = require('./components/options');
  var ColorPicker = require('./components/color-picker');
  var BrickPicker = require('./components/brick-picker');
  
  var Toolbar = React.createClass({displayName: "Toolbar",
    propTypes: {
    },
    getInitialState: function() {
      return {
        colors: { rows: [] },
        selectedColors: [],
        selectedBrickTypes: Globals.initialBrickTypes,
        numVerticalBlocks: this.getDefaultHeight(),
        stackMode: false,
        bricker: null,
        mosaicDimension: { width: 0, height: 0 },
        ready: false,
        instructions: null,
        thumbnails: this.props.initialThumbnails
      };
    },
    componentDidMount: function() {
      var self = this;
      $.ajax({
        type: 'GET',
        url: this.props.colorsURL,
        dataType: 'text',
        success: function(csv_text) {
          var colors = new Colors(csv_text);
          console.log('Successfully fetched colors CSV (', self.props.colorsURL, ')');
          self.initializeColors(colors);
        }
      });
      this.props.image.on('load', function() {
        self.resetBricker();
      });
    },
    initializeColors: function(colors) {
      var self = this;
      this.setState({ colors: colors });
      setTimeout(function() {
        self.setState({ selectedColors: colors.getDefaultIDs() });
        self.resetBricker();
      }, 1);
    },
    resetBricker: function() {
      var self = this;
      if (this.state.bricker) {
        this.state.bricker.destroy();
      }
      var bricker = new Bricker(this.props.image,
                                this.state.numVerticalBlocks,
                                this.state.colors,
                                this.state.selectedColors,
                                this.state.stackMode, function(dim) {
                                  self.setState({ mosaicDimension: dim });
                                });
      self.setState({ ready: false });
      bricker.ditherImage(function() {
        self.refreshInstructions();
        self.setState({ ready: true });
      });
      self.setState({ bricker: bricker });
    },
    getDefaultHeight: function() {
      var height = Math.floor(this.props.image[0].naturalHeight / (Globals.blockSize / 4));
      return height > Globals.defaultHeight ? Globals.defaultHeight : height;
    },
    changeImage: function(src, use_colors, dimension) {
      $(Globals.displayBoxSelector).remove();
      if (!use_colors) {
        use_colors = this.state.colors.getDefaultIDs();
      }
  
      var state = { selectedColors: use_colors };
      if (dimension) {
        state.numVerticalBlocks = dimension;
      }
  
      this.setState(state, function() {
        this.props.image[0].src = src;
      });
    },
    addToThumbnails: function(src, file_name) {
      var self = this;
      var thumbnails = this.state.thumbnails;
      thumbnails.push({ src: src, title: file_name });
      this.setState({ thumbnails: thumbnails });
      self.changeImage(src);
    },
    refreshInstructions: function() {
      var bricker = this.state.bricker;
      var brick_types = this.state.selectedBrickTypes;
      var instructions = bricker.generateInstructions(brick_types);
      this.setState({ instructions: instructions });
      this.props.diagram.updateInstructions(instructions, this.state.stackMode, this.state.colors);
    },
    updateHeight: function(height, stackMode) {
      var self = this;
      if (stackMode !== this.state.stackMode) {
        this.setState({ numVerticalBlocks: height, stackMode: stackMode }, function() {
          this.resetBricker();
        });
        return;
      }
  
      self.setState({ ready: false });
      this.state.bricker.changeSize(height, function() {
        self.refreshInstructions();
        self.setState({ ready: true });
      });
      this.setState({ numVerticalBlocks: height });
    },
    updateSelectedBricks: function(selected_bricks) {
      var self = this;
      selected_bricks.sort(function(a, b) { return b-a; });
      this.setState({ selectedBrickTypes: selected_bricks }, function() {
        self.resetBricker();
      });
    },
    addToPalette: function(selected_id) {
      var ids = this.state.selectedColors;
      if (ids.indexOf(selected_id) === -1) {
        ids.push(selected_id);
        this.setState({ selectedColors: ids });
      }
    },
    removeFromPalette: function(selected_id) {
      var ids = this.state.selectedColors;
      var index = ids.indexOf(selected_id);
      if (index !== -1) {
        ids.splice(index, 1);
        this.setState({ selectedColors: ids });
      }
    },
    render: function() {
      var self = this;
      var data = {
        ready: this.state.ready,
        handleAddToPalette: this.addToPalette,
        handleRemoveFromPalette: this.removeFromPalette,
        handleReset: this.resetBricker,
        handleUpdateHeight: this.updateHeight,
        handleUpdateSelectedBricks: this.updateSelectedBricks,
        handleChangeImage: this.changeImage,
        handleUploadedImage: this.addToThumbnails,
        handleStackMode: function() {
          self.setState({ stackMode: !self.state.stackMode });
        }
      };
      return (
        React.createElement("div", null, 
          React.createElement(Thumbnails, {data: data, 
                        thumbnails: this.state.thumbnails}), 
          React.createElement(Instruction, {data: data, 
                        instructions: this.state.instructions}), 
          React.createElement(Options, {data: data, 
                        dimension: this.state.mosaicDimension, 
                        defaultHeight: this.state.numVerticalBlocks, 
                        stackMode: this.state.stackMode}), 
          React.createElement(BrickPicker, {data: data, 
                        selectedBrickTypes: this.state.selectedBrickTypes}), 
          React.createElement(ColorPicker, {data: data, 
                        colors: this.state.colors.rows, 
                        selectedColors: this.state.selectedColors})
        )
      );
    }
  });
  
  module.exports = Toolbar;
  
  },{"./bricker":3,"./colors":4,"./components/brick-picker":5,"./components/color-picker":6,"./components/instruction":7,"./components/options":8,"./components/thumbnails":9,"./globals":12}]},{},[13]);
  