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

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _ndarrayUnpack = require('ndarray-unpack');

var _ndarrayUnpack2 = _interopRequireDefault(_ndarrayUnpack);

var _flattenDeep = require('lodash/flattenDeep');

var _flattenDeep2 = _interopRequireDefault(_flattenDeep);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * BatchNormalization layer class
 */
var BatchNormalization = function (_Layer) {
  _inherits(BatchNormalization, _Layer);

  /**
   * Creates an BatchNormalization layer
   */
  function BatchNormalization() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, BatchNormalization);

    var _this = _possibleConstructorReturn(this, (BatchNormalization.__proto__ || Object.getPrototypeOf(BatchNormalization)).call(this, attrs));

    _this.layerClass = 'BatchNormalization';

    var _attrs$epsilon = attrs.epsilon,
        epsilon = _attrs$epsilon === undefined ? 0.001 : _attrs$epsilon,
        _attrs$axis = attrs.axis,
        axis = _attrs$axis === undefined ? -1 : _attrs$axis,
        _attrs$center = attrs.center,
        center = _attrs$center === undefined ? true : _attrs$center,
        _attrs$scale = attrs.scale,
        scale = _attrs$scale === undefined ? true : _attrs$scale;


    _this.epsilon = epsilon;
    _this.center = center;
    _this.scale = scale;

    // no batch axis, so axis is less 1 compared to representation in keras
    // will be set in call(), as input tensor shape is needed to calculate axis
    // if axis < 0
    _this.axis = axis;
    _this.axisNormalized = false;

    // Layer weights specification
    _this.params = [];
    if (_this.scale) {
      _this.params.push('gamma');
    }
    if (_this.center) {
      _this.params.push('beta');
    }
    _this.params = _this.params.concat(['moving_mean', 'moving_variance']);

    // GPU setup
    if (_this.gpu) {
      _this.program = _WebGL.webgl2.compileProgram(require('./BatchNormalization.webgl2.glsl'));
    }
    return _this;
  }

  /**
   * Layer computational logic
   *
   * @param {Tensor} x
   * @returns {Tensor}
   */


  _createClass(BatchNormalization, [{
    key: 'call',
    value: function call(x) {
      if (!this.axisNormalized) {
        this.axis = this.axis < 0 ? x.tensor.shape.length + this.axis : this.axis - 1;
        this.axisNormalized = true;
      }

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
      var broadcast = [];
      for (var d = 0; d < x.tensor.shape.length; d++) {
        if (d === this.axis) broadcast.push(1);else broadcast.push(null);
      }

      // broadcast weights
      var _gamma = new _Tensor2.default([], x.tensor.shape);
      var _beta = new _Tensor2.default([], x.tensor.shape);
      for (var i = 0; i < x.tensor.shape[this.axis]; i++) {
        broadcast[this.axis] = i;
        if (this.scale) {
          var _gamma$tensor;

          _ndarrayOps2.default.assigns((_gamma$tensor = _gamma.tensor).pick.apply(_gamma$tensor, broadcast), this.weights.gamma.tensor.get(i));
        }
        if (this.center) {
          var _beta$tensor;

          _ndarrayOps2.default.assigns((_beta$tensor = _beta.tensor).pick.apply(_beta$tensor, broadcast), this.weights.beta.tensor.get(i));
        }
      }

      var _mean = new _Tensor2.default([], x.tensor.shape);
      var _std = new _Tensor2.default([], x.tensor.shape);

      // feature-wise normalization
      for (var _i = 0; _i < x.tensor.shape[this.axis]; _i++) {
        var _mean$tensor, _std$tensor;

        broadcast[this.axis] = _i;
        _ndarrayOps2.default.assigns((_mean$tensor = _mean.tensor).pick.apply(_mean$tensor, broadcast), this.weights.moving_mean.tensor.get(_i));
        _ndarrayOps2.default.assigns((_std$tensor = _std.tensor).pick.apply(_std$tensor, broadcast), this.weights.moving_variance.tensor.get(_i) + this.epsilon);
      }
      _ndarrayOps2.default.sqrteq(_std.tensor);

      this.output = new _Tensor2.default(x.tensor.data, x.tensor.shape);

      _ndarrayOps2.default.subeq(this.output.tensor, _mean.tensor);
      _ndarrayOps2.default.diveq(this.output.tensor, _std.tensor);
      if (this.scale) {
        _ndarrayOps2.default.muleq(this.output.tensor, _gamma.tensor);
      }
      if (this.center) {
        _ndarrayOps2.default.addeq(this.output.tensor, _beta.tensor);
      }
    }

    /**
     * GPU call
     * Will only work on the 2D-tiled representation for post-convolutional BN
     */

  }, {
    key: '_call_gpu',
    value: function _call_gpu(x) {
      if (x.tensor.shape.length <= 2 && !x.glTexture) {
        x.createGLTexture();
      } else if (x.tensor.shape.length > 2 && !x.glTextureIsTiled) {
        x.reshapeTensorToTiled(this.axis);
        x.createGLTexture();
      }

      // create output textures if doesn't already exist
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
      var textureNames = ['X'];
      if (this.scale) {
        textures.push(this.weights['gamma'].glTexture);
        textureTypes.push('2d');
        textureNames.push('gamma');
      }
      if (this.center) {
        textures.push(this.weights['beta'].glTexture);
        textureTypes.push('2d');
        textureNames.push('beta');
      }
      textures.push(this.weights['moving_mean'].glTexture, this.weights['moving_variance'].glTexture);
      textureTypes.push('2d', '2d');
      textureNames.push('mean', 'std');
      _WebGL.webgl2.bindInputTextures(this.program, textures, textureTypes, textureNames);
      var uniforms = [this.epsilon, this.output.glTextureShape[0], this.output.glTextureShape[1], +this.scale, +this.center];
      var uniformTypes = ['float', 'int', 'int', 'bool', 'bool'];
      var uniformNames = ['epsilon', 'rows', 'cols', 'scale', 'center'];
      _WebGL.webgl2.bindUniforms(this.program, uniforms, uniformTypes, uniformNames);
      _WebGL.webgl2.runProgram();

      // GPU -> CPU data transfer
      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
        if (this.output.glTextureIsTiled) {
          this.output.reshapeTensorFromTiled(this.axis);
        }
      }
    }
  }]);

  return BatchNormalization;
}(_Layer3.default);

exports.default = BatchNormalization;