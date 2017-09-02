'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _activations = require('../../activations');

var activations = _interopRequireWildcard(_activations);

var _WebGL = require('../../WebGL2');

var _ndarrayBlasLevel = require('ndarray-blas-level2');

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Dense layer class
 */
var Dense = function (_Layer) {
  _inherits(Dense, _Layer);

  /**
   * Creates a Dense layer
   * @param {Number} attrs.units - output dimension size
   * @param {Object} [attrs] - layer attributes
   */
  function Dense() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Dense);

    var _this = _possibleConstructorReturn(this, (Dense.__proto__ || Object.getPrototypeOf(Dense)).call(this, attrs));

    _this.layerClass = 'Dense';

    var _attrs$units = attrs.units,
        units = _attrs$units === undefined ? 1 : _attrs$units,
        _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'linear' : _attrs$activation,
        _attrs$input_dim = attrs.input_dim,
        input_dim = _attrs$input_dim === undefined ? null : _attrs$input_dim,
        _attrs$use_bias = attrs.use_bias,
        use_bias = _attrs$use_bias === undefined ? true : _attrs$use_bias;


    _this.activation = activation;
    _this.activationFunc = activations[_this.activation];
    _this.units = units;
    _this.input_dim = input_dim;
    _this.use_bias = use_bias;

    // Layer weights specification
    _this.params = _this.use_bias ? ['kernel', 'bias'] : ['kernel'];

    // Input shape specification
    if (_this.input_dim) {
      _this.inputShape = [_this.input_dim];
    }

    // Output
    _this.output_preactiv = new _Tensor2.default([], [_this.units]);
    _this.output = new _Tensor2.default([], [_this.units]);

    // GPU setup
    if (_this.gpu) {
      _this.matMulProgram = _WebGL.webgl2.compileProgram(require('../../matMul.webgl2.glsl'));
      _this.activationProgram = _WebGL.webgl2.compileProgram(require(`../../activations/${_this.activation}.webgl2.glsl`));
      _this.output_preactiv.createGLTexture();
      _this.output.createGLTexture();
    }
    return _this;
  }

  /**
   * Layer computational logic
   *
   * @param {Tensor} x
   * @returns {Tensor}
   */


  _createClass(Dense, [{
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
      if (this.use_bias) {
        _ndarrayOps2.default.assign(this.output.tensor, this.weights['bias'].tensor);
      }
      (0, _ndarrayBlasLevel.gemv)(1, this.weights['kernel'].tensor.transpose(1, 0), x.tensor, 1, this.output.tensor);
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

      // Matrix Multiply
      _WebGL.webgl2.selectProgram(this.matMulProgram);
      _WebGL.webgl2.bindOutputTexture(this.output_preactiv.glTexture, this.output_preactiv.glTextureShape);
      var textures = [x.glTexture, this.weights['kernel'].glTexture];
      var textureTypes = ['2d', '2d'];
      var textureNames = ['A', 'B'];
      if (this.use_bias) {
        textures.push(this.weights['bias'].glTexture);
        textureTypes.push('2d');
        textureNames.push('C');
      }
      _WebGL.webgl2.bindInputTextures(this.matMulProgram, textures, textureTypes, textureNames);
      var uniforms = [this.use_bias ? 1 : 0, x.glTextureShape[0]].concat(_toConsumableArray(this.weights['kernel'].glTextureShape));
      var uniformTypes = ['bool', 'int', 'int', 'int'];
      var uniformNames = ['addC', 'M', 'K', 'N'];
      _WebGL.webgl2.bindUniforms(this.matMulProgram, uniforms, uniformTypes, uniformNames);
      _WebGL.webgl2.runProgram();

      // Activation
      _WebGL.webgl2.selectProgram(this.activationProgram);
      _WebGL.webgl2.bindOutputTexture(this.output.glTexture, this.output.glTextureShape);
      textures = [this.output_preactiv.glTexture];
      textureTypes = ['2d'];
      textureNames = ['x'];
      _WebGL.webgl2.bindInputTextures(this.activationProgram, textures, textureTypes, textureNames);
      _WebGL.webgl2.runProgram();

      // GPU -> CPU data transfer
      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
      }
    }
  }]);

  return Dense;
}(_Layer3.default);

exports.default = Dense;