/*
 *  Bubbles Plugin
 *
 *  Made by Nick Jonas
 *  Under MIT License
 *
 *  Dependencies: jQuery, TweenMax
 */
;(function ( $, window, document, undefined ) {

  // Create the defaults once
  var pluginName = "bubbles",
    defaults = {
    bubbleCount: 20,
    minDiam: 6,
    maxDiam: 40,
    blur: false
  };

  // The actual plugin constructor
  function Plugin ( element, options ) {
    this.element = element;
    this.settings = $.extend( {}, defaults, options );
    this._defaults = defaults;
    this._name = pluginName;
    this.features = [];
    this.measurements = {
      x: null,
      y: null,
      z: null,
      alpha: null,
      beta: null,
      gamma: null
    };
    this.calibration = {
      x: null,
      y: null,
      z: null,
      alpha: 0,
      beta: 0,
      gamma: 0
    };
    this.init();
    $(element).data('isPlaying', false);
  }

  Plugin.prototype = {

    init: function () {

      //this.setupGyro();
      this.createBubbles();
      //this.animateBubbles();

    },

    start: function(){
      console.log('start bubbles!');
    },

    stop: function(){
      console.log('stop bubbles!');
    },

    setupGyro: function(){
      var features = this.features,
        measurements = this.measurements,
        calibration = this.calibration;
      window.addEventListener('MozOrientation', function(e) {
        features.push('MozOrientation');
        measurements.x = e.x - calibration.x;
        measurements.y = e.y - calibration.y;
        measurements.z = e.z - calibration.z;
      }, true);

      window.addEventListener('devicemotion', function(e) {
        features.push('devicemotion');
        measurements.x = e.accelerationIncludingGravity.x - calibration.x;
        measurements.y = e.accelerationIncludingGravity.y - calibration.y;
        measurements.z = e.accelerationIncludingGravity.z - calibration.z;
      }, true);

      window.addEventListener('deviceorientation', function(e) {
        features.push('deviceorientation');
        measurements.alpha = e.alpha - calibration.alpha;
        measurements.beta = e.beta - calibration.beta;
        measurements.gamma = e.gamma - calibration.gamma;
      }, true);
    },

    map_range: function(value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    },

    createBubbles: function(){
      var self = this,
        el = this.element,
        width = $(window).width(),
        height = $(window).height(),
        canvas = document.createElement('canvas');

      if(this.settings.canvasId) $(canvas).attr('id', this.settings.canvasId);

      el.style.width = canvas.width = width;
      el.style.height = canvas.height = height;

      el.appendChild(canvas);

      var bubbles = [];
      var ctx = canvas.getContext('2d');
      for(var i = 0; i < this.settings.bubbleCount; i++){

        var diam = (Math.random() * (this.settings.maxDiam - this.settings.minDiam)) + this.settings.minDiam,
          x = Math.floor(Math.random() * width),
          y = height + (diam / 2) + Math.random() * 100,
          opacity = Math.random(1),
          speed = (Math.random() / 2) + 0.1,
          amplitude = (Math.random() * 50) + 45,
          isOutline = false;//Math.random() > 0.5;

        var bubble = {
          startX: x,
          x: x,
          y: y,
          radius: diam / 2,
          speed: speed,
          opacity: self.map_range(opacity, 0, 1, 0, 0.4),
          amplitude: amplitude,
          isOutline: isOutline
        };

      // console.log(opacity);

        bubbles.push(bubble);

      }


      var count = 0;
      function animate(){

        if(!$(el).data('isPlaying')){
          for(var j = 0; j < bubbles.length; j++){
            bubbles[j].y = height + (diam / 2);
          }
          return;
        }

        count++;

        ctx.clearRect(0, 0, width, height);

        for(var i = 0; i < bubbles.length; i++){
          var b = bubbles[i];

          // if reached top, send back to bottom
          if(b.y <= b.radius * -2){
            b.y = window.innerHeight + b.radius;
          }

          b.y = b.y - b.speed;
          b.x = b.startX + Math.sin(count / b.amplitude) * 50;

          ctx.beginPath();
          if(b.isOutline){
            ctx.strokeStyle = 'rgb(94,202,255)';
            ctx.lineWidth = 2;
            ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, false);
            ctx.stroke();
          }else{
            ctx.fillStyle = 'rgba(94,202,255, ' + b.opacity + ')';
            ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, false);
            ctx.fill();
          }
        }
      }


      // shim layer with setTimeout fallback
      window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                function( callback ){
                  window.setTimeout(callback, 1000 / 60);
                };
      })();
      (function animloop(){
        requestAnimFrame(animloop);
        animate();
      })();

    }

  };


  $.fn.startBubbleAnimation = function ( options ) {
    $(this).each(function(i){
      var $this = $(this);
      $this.data('isPlaying', true);
    });
  };

  $.fn.stopBubbleAnimation = function ( options ) {
    $(this).each(function(i){
      var $this = $(this);
      $this.data('isPlaying', false);
    });
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[ pluginName ] = function ( options ) {
    return this.each(function() {
      if( !$.data( this, "plugin_" + pluginName ) ) {
        $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
      }
    });
  };

})( jQuery, window, document );
