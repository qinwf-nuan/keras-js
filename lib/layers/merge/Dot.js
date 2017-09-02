'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Merge3 = require('./_Merge');

var _Merge4 = _interopRequireDefault(_Merge3);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _WebGL = require('../../WebGL2');

var _ndarrayGemm = require('ndarray-gemm');

var _ndarrayGemm2 = _interopRequireDefault(_ndarrayGemm);

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Dot merge layer class, extends abstract _Merge class
 */
var Dot = function (_Merge2) {
  _inherits(Dot, _Merge2);

  /**
   * Creates a Dot merge layer
   */
  function Dot() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Dot);

    var _this = _possibleConstructorReturn(this, (Dot.__proto__ || Object.getPrototypeOf(Dot)).call(this, attrs));

    _this.layerClass = 'Dot';

    _this.mode = 'dot';

    var _attrs$axes = attrs.axes,
        axes = _attrs$axes === undefined ? -1 : _attrs$axes,
        _attrs$normalize = attrs.normalize,
        normalize = _attrs$normalize === undefined ? false : _attrs$normalize;

    // no mini-batch axis here, so we subtract 1 if given axis > 0

    if (Array.isArray(axes)) {
      _this.dotAxes = [axes[0] <= 0 ? axes[0] : axes[0] - 1, axes[1] <= 0 ? axes[1] : axes[1] - 1];
    } else {
      _this.dotAxes = [axes <= 0 ? axes : axes - 1, axes <= 0 ? axes : axes - 1];
    }

    _this.normalize = normalize;

    // GPU setup
    if (_this.gpu) {
      _this.mergeProgram = _WebGL.webgl2.compileProgram(require('./Dot.webgl2.glsl'));
    }
    return _this;
  }

  /**
   * Calculate output shape
   * @param {Number[][]} inputShapes
   */


  _createClass(Dot, [{
    key: '_calcOutputShape',
    value: function _calcOutputShape(inputShapes) {
      var shape1 = inputShapes[0].slice();
      var shape2 = inputShapes[1].slice();
      shape1.splice(this.dotAxes[0], 1);
      shape2.splice(this.dotAxes[1], 1);
      this.outputShape = shape1.concat(shape2);
      if (this.outputShape.length === 1) {
        this.outputShape.push(1);
      }
    }

    /**
     * CPU call
     * @param {Tensor[]} inputs
     */

  }, {
    key: '_call_cpu',
    value: function _call_cpu(inputs) {
      this._calcOutputShape([inputs[0].tensor.shape, inputs[1].tensor.shape]);
      this.output = new _Tensor2.default([], this.outputShape);

      if (inputs[0].tensor.shape.length === 2 && inputs[1].tensor.shape.length === 2) {
        if (this.dotAxes[0] === 0 && this.dotAxes[1] === 0) {
          if (this.normalize) {
            for (var i = 0; i < inputs[0].tensor.shape[1]; i++) {
              _ndarrayOps2.default.divseq(inputs[0].tensor.pick(null, i), _ndarrayOps2.default.norm2(inputs[0].tensor.pick(null, i)));
            }
            for (var _i = 0; _i < inputs[1].tensor.shape[1]; _i++) {
              _ndarrayOps2.default.divseq(inputs[1].tensor.pick(null, _i), _ndarrayOps2.default.norm2(inputs[1].tensor.pick(null, _i)));
            }
          }
          (0, _ndarrayGemm2.default)(this.output.tensor, inputs[0].tensor.transpose(1, 0), inputs[1].tensor);
        } else if (this.dotAxes[0] === 1 && this.dotAxes[1] === 1) {
          if (this.normalize) {
            for (var _i2 = 0; _i2 < inputs[0].tensor.shape[0]; _i2++) {
              _ndarrayOps2.default.divseq(inputs[0].tensor.pick(_i2, null), _ndarrayOps2.default.norm2(inputs[0].tensor.pick(_i2, null)));
            }
            for (var _i3 = 0; _i3 < inputs[1].tensor.shape[0]; _i3++) {
              _ndarrayOps2.default.divseq(inputs[1].tensor.pick(_i3, null), _ndarrayOps2.default.norm2(inputs[1].tensor.pick(_i3, null)));
            }
          }
          (0, _ndarrayGemm2.default)(this.output.tensor, inputs[0].tensor, inputs[1].tensor.transpose(1, 0));
        }
      } else {
        throw new Error(`${this.name} [${this.layerClass} layer] dot mode for 3+ dim tensors not yet implemented.`);
      }
    }

    /**
     * GPU call
     * @param {Tensor[]} inputs
     */

  }, {
    key: '_call_gpu',
    value: function _call_gpu(inputs) {
      this._calcOutputShape([inputs[0].glTextureShape, inputs[1].glTextureShape]);

      // create output textures if doesn't already exist
      if (!this.output) {
        this.output = new _Tensor2.default([], this.outputShape);
        this.output.createGLTexture();
      }

      var commonDim = inputs[0].glTextureShape[this.dotAxes[0]];

      _WebGL.webgl2.selectProgram(this.mergeProgram);
      _WebGL.webgl2.bindOutputTexture(this.output.glTexture, this.output.glTextureShape);
      var uniforms = [].concat(_toConsumableArray(this.output.glTextureShape), _toConsumableArray(this.dotAxes), [commonDim, +this.normalize]);
      var uniformTypes = ['int', 'int', 'int', 'int', 'int', 'bool'];
      var uniformNames = ['rows', 'cols', 'dotAxis1', 'dotAxis2', 'commonDim', 'normalize'];
      _WebGL.webgl2.bindUniforms(this.mergeProgram, uniforms, uniformTypes, uniformNames);
      var textures = [inputs[0].glTexture, inputs[1].glTexture];
      var textureTypes = ['2d', '2d'];
      var textureNames = ['input1', 'input2'];
      _WebGL.webgl2.bindInputTextures(this.mergeProgram, textures, textureTypes, textureNames);
      _WebGL.webgl2.runProgram();

      // GPU -> CPU data transfer
      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
      }
    }
  }]);

  return Dot;
}(_Merge4.default);

exports.default = Dot;