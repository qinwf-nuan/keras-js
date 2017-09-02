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

var _ndarrayConcatRows = require('ndarray-concat-rows');

var _ndarrayConcatRows2 = _interopRequireDefault(_ndarrayConcatRows);

var _sum = require('lodash/sum');

var _sum2 = _interopRequireDefault(_sum);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Concatenate merge layer class, extends abstract _Merge class
 */
var Concatenate = function (_Merge2) {
  _inherits(Concatenate, _Merge2);

  /**
   * Creates a Concatenate merge layer
   */
  function Concatenate() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Concatenate);

    var _this = _possibleConstructorReturn(this, (Concatenate.__proto__ || Object.getPrototypeOf(Concatenate)).call(this, attrs));

    _this.layerClass = 'Concatenate';

    _this.mode = 'concat';

    var _attrs$axis = attrs.axis,
        axis = _attrs$axis === undefined ? -1 : _attrs$axis;

    // no mini-batch axis here, so we subtract 1 if given axis > 0

    _this.concatAxis = axis <= 0 ? axis : axis - 1;

    // GPU setup
    if (_this.gpu) {
      _this.mergeProgram = _WebGL.webgl2.compileProgram(require('./Concatenate.webgl2.glsl'));
    }
    return _this;
  }

  /**
   * CPU call
   * @param {Tensor[]} inputs
   */


  _createClass(Concatenate, [{
    key: '_call_cpu',
    value: function _call_cpu(inputs) {
      var outputShape = inputs[0].tensor.shape.slice();
      var _concatAxis = this.concatAxis < 0 ? outputShape.length + this.concatAxis : this.concatAxis;
      inputs.slice(1, inputs.length).forEach(function (x) {
        var d = x.tensor.shape.slice()[_concatAxis];
        outputShape[_concatAxis] += d;
      });
      this.output = new _Tensor2.default([], outputShape);

      if (_concatAxis === 0) {
        (0, _ndarrayConcatRows2.default)(this.output.tensor, inputs.map(function (x) {
          return x.tensor;
        }));
      } else {
        var _output$tensor;

        var dimsAxisSwap = [_concatAxis];
        for (var i = 0; i < inputs[0].tensor.shape.length; i++) {
          if (i !== _concatAxis) dimsAxisSwap.push(i);
        }
        (0, _ndarrayConcatRows2.default)((_output$tensor = this.output.tensor).transpose.apply(_output$tensor, dimsAxisSwap), inputs.map(function (x) {
          var _x$tensor;

          return (_x$tensor = x.tensor).transpose.apply(_x$tensor, dimsAxisSwap);
        }));
      }
    }

    /**
     * GPU call
     * @param {Tensor[]} inputs
     */

  }, {
    key: '_call_gpu',
    value: function _call_gpu(inputs) {
      var outputShape = inputs[0].glTextureShape.slice();
      var _concatAxis = this.concatAxis < 0 ? outputShape.length + this.concatAxis : this.concatAxis;

      // create output textures if doesn't already exist
      if (!this.output) {
        outputShape[_concatAxis] = (0, _sum2.default)(inputs.map(function (input) {
          return input.glTextureShape[_concatAxis];
        }));
        this.output = new _Tensor2.default([], outputShape);
        this.output.createGLTexture();
        if (inputs[0].glTextureIsTiled) {
          this.output.glTextureIsTiled = inputs[0].glTextureIsTiled;
          this.output.untiledShape = inputs[0].untiledShape;
        }
      }
      if (!this.runningOutput) {
        this.runningOutput = new _Tensor2.default([], outputShape);
        this.runningOutput.createGLTexture();
      }

      var numInputs = inputs.length;

      var offsetStart = 0;
      var offsetEnd = inputs[0].glTextureShape[_concatAxis];
      for (var i = 0; i < numInputs; i++) {
        // copy output texture to intermediate output
        _WebGL.webgl2.selectProgram(this.copyTextureProgram);
        _WebGL.webgl2.bindOutputTexture(this.runningOutput.glTexture, this.runningOutput.glTextureShape);
        _WebGL.webgl2.bindInputTextures(this.copyTextureProgram, [this.output.glTexture], ['2d'], ['source']);
        _WebGL.webgl2.runProgram();

        // run merge program
        _WebGL.webgl2.selectProgram(this.mergeProgram);
        _WebGL.webgl2.bindOutputTexture(this.output.glTexture, this.output.glTextureShape);
        var uniforms = [].concat(_toConsumableArray(this.output.glTextureShape), [_concatAxis, offsetStart, offsetEnd]);
        var uniformTypes = ['int', 'int', 'int', 'int', 'int'];
        var uniformNames = ['rows', 'cols', 'concatAxis', 'offsetStart', 'offsetEnd'];
        _WebGL.webgl2.bindUniforms(this.mergeProgram, uniforms, uniformTypes, uniformNames);
        var textures = [this.runningOutput.glTexture, inputs[i].glTexture];
        var textureTypes = ['2d', '2d'];
        var textureNames = ['runningOutput', 'input1'];
        _WebGL.webgl2.bindInputTextures(this.mergeProgram, textures, textureTypes, textureNames);
        _WebGL.webgl2.runProgram();

        if (i < numInputs - 1) {
          offsetStart += inputs[i].glTextureShape[_concatAxis];
          offsetEnd += inputs[i + 1].glTextureShape[_concatAxis];
        }
      }

      // GPU -> CPU data transfer
      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
      }
    }
  }]);

  return Concatenate;
}(_Merge4.default);

exports.default = Concatenate;