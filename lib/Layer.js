'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tensor = require('./Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _WebGL = require('./WebGL2');

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Layer class
 */
var Layer = function () {
  /**
   * Creates a layer
   * @param {Object} [attrs] - layer attributes
   */
  function Layer() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Layer);

    this.layerClass = 'Layer';
    this.name = attrs.name;
    this.gpu = _WebGL.webgl2.isSupported && attrs.gpu;

    this.params = [];
    this.weights = {};

    this.inbound = [];
    this.outbound = [];
  }

  /**
   * Set layer weights
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(Layer, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      var _this = this;

      var createGLTexture = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      this.params.forEach(function (p, i) {
        _this.weights[p] = weightsArr[i];

        if (_this.gpu && createGLTexture) {
          _this.weights[p].createGLTexture();
        }
      });
    }

    /**
     * Layer computational logic
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: 'call',
    value: function call(x) {
      return x;
    }

    /**
     * Toggle GPU mode on/off
     *
     * @param {Boolean} mode - on/off
     */

  }, {
    key: 'toggleGpu',
    value: function toggleGpu(mode) {
      var newMode = typeof mode === 'undefined' ? !this.gpu : mode;
      if (_WebGL.webgl2.isSupported && newMode) {
        this.gpu = true;
      } else {
        this.gpu = false;
      }
    }
  }]);

  return Layer;
}();

exports.default = Layer;