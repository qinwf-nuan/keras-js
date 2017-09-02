'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _WebGL = require('../../WebGL2');

var _activations = require('../../activations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * LeakyReLU advanced activation layer class
 */
var LeakyReLU = function (_Layer) {
  _inherits(LeakyReLU, _Layer);

  /**
   * Creates a LeakyReLU activation layer
   * @param {number} attrs.alpha - negative slope coefficient
   */
  function LeakyReLU() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, LeakyReLU);

    var _this = _possibleConstructorReturn(this, (LeakyReLU.__proto__ || Object.getPrototypeOf(LeakyReLU)).call(this, attrs));

    _this.layerClass = 'LeakyReLU';

    var _attrs$alpha = attrs.alpha,
        alpha = _attrs$alpha === undefined ? 0.3 : _attrs$alpha;


    _this.alpha = alpha;

    // GPU setup
    if (_this.gpu) {
      _this.program = _WebGL.webgl2.compileProgram(require('./LeakyReLU.webgl2.glsl'));
    }
    return _this;
  }

  /**
   * Layer computational logic
   *
   * @param {Tensor} x
   * @returns {Tensor}
   */


  _createClass(LeakyReLU, [{
    key: 'call',
    value: function call(x) {
      if (this.gpu) {
        this._call_gpu(x);
      } else {
        this._call_cpu(x);
      }
      return this.output;
    }

    /**
     * CPU call
     */

  }, {
    key: '_call_cpu',
    value: function _call_cpu(x) {
      this.output = x;
      (0, _activations.relu)(this.output, { alpha: this.alpha });
    }

    /**
     * GPU call
     */

  }, {
    key: '_call_gpu',
    value: function _call_gpu(x) {
      if (!x.glTexture) {
        x.createGLTexture();
      }

      if (!this.output) {
        this.output = new _Tensor2.default([], x.glTextureShape);
        this.output.createGLTexture();
        if (x.glTextureIsTiled) {
          this.output.glTextureIsTiled = x.glTextureIsTiled;
          this.output.untiledShape = x.untiledShape;
        }
      }

      _WebGL.webgl2.selectProgram(this.program);
      _WebGL.webgl2.bindOutputTexture(this.output.glTexture, this.output.glTextureShape);
      var textures = [x.glTexture];
      var textureTypes = ['2d'];
      var textureNames = ['x'];
      _WebGL.webgl2.bindInputTextures(this.program, textures, textureTypes, textureNames);
      var uniforms = [this.alpha];
      var uniformTypes = ['float'];
      var uniformNames = ['alpha'];
      _WebGL.webgl2.bindUniforms(this.program, uniforms, uniformTypes, uniformNames);
      _WebGL.webgl2.runProgram();

      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
      }
    }
  }]);

  return LeakyReLU;
}(_Layer3.default);

exports.default = LeakyReLU;