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

var activations = _interopRequireWildcard(_activations);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Activation layer class
 */
var Activation = function (_Layer) {
  _inherits(Activation, _Layer);

  /**
   * Creates an Activation layer
   * @param {String} attrs.activation - name of activation function
   */
  function Activation() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Activation);

    var _this = _possibleConstructorReturn(this, (Activation.__proto__ || Object.getPrototypeOf(Activation)).call(this, attrs));

    _this.layerClass = 'Activation';

    var _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'linear' : _attrs$activation;


    _this.activation = activation;
    _this.activationFunc = activations[activation];

    // GPU setup
    if (_this.gpu) {
      _this.program = _WebGL.webgl2.compileProgram(require(`../../activations/${_this.activation}.webgl2.glsl`));
    }
    return _this;
  }

  /**
   * Layer computational logic
   *
   * @param {Tensor} x
   * @returns {Tensor}
   */


  _createClass(Activation, [{
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
      this.activationFunc(this.output);
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
      _WebGL.webgl2.runProgram();

      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
      }
    }
  }]);

  return Activation;
}(_Layer3.default);

exports.default = Activation;