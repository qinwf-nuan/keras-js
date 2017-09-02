'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WebGLLayer2 = require('../WebGLLayer');

var _WebGLLayer3 = _interopRequireDefault(_WebGLLayer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebGLConv2D = function (_WebGLLayer) {
  _inherits(WebGLConv2D, _WebGLLayer);

  function WebGLConv2D() {
    _classCallCheck(this, WebGLConv2D);

    var _this = _possibleConstructorReturn(this, (WebGLConv2D.__proto__ || Object.getPrototypeOf(WebGLConv2D)).call(this));

    _this.inputTransformProgram = _this.webgl.createProgram(require('./input_transform.glsl'));
    _this.mainProgram = _this.webgl.createProgram(require('./conv2d.glsl'));
    return _this;
  }

  _createClass(WebGLConv2D, [{
    key: '_bindInputTexturesInputTransform',


    /**
     * Bind WebGL input textures for input transform operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} indexMappingRow
     * @param {weblas.pipeline.Tensor} indexMappingCol
     */
    value: function _bindInputTexturesInputTransform(input, indexMappingRow, indexMappingCol) {
      var gl = this.webgl.context;
      this.numTextures = 3;
      this._bindInputTexture(this.inputTransformProgram, input.texture, gl.TEXTURE0, WebGLConv2D.INPUT_TEXTURE_NAME);
      this._bindInputTexture(this.inputTransformProgram, indexMappingRow.texture, gl.TEXTURE1, WebGLConv2D.IMAP_ROW_TEXTURE_NAME);
      this._bindInputTexture(this.inputTransformProgram, indexMappingCol.texture, gl.TEXTURE2, WebGLConv2D.IMAP_COL_TEXTURE_NAME);
    }

    /**
     * Bind WebGL input textures for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} weights
     * @param {weblas.pipeline.Tensor} bias
     */

  }, {
    key: '_bindInputTexturesMain',
    value: function _bindInputTexturesMain(input, weights, bias) {
      var gl = this.webgl.context;
      this.numTextures = 3;
      this._bindInputTexture(this.mainProgram, input.texture, gl.TEXTURE0, WebGLConv2D.INPUT_TEXTURE_NAME);
      this._bindInputTexture(this.mainProgram, weights.texture, gl.TEXTURE1, WebGLConv2D.WEIGHTS_TEXTURE_NAME);
      this._bindInputTexture(this.mainProgram, bias.texture, gl.TEXTURE2, WebGLConv2D.BIAS_TEXTURE_NAME);
    }

    /**
     * Bind WebGL uniforms for input transform operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} indexMappingRow
     */

  }, {
    key: '_bindUniformsInputTransform',
    value: function _bindUniformsInputTransform(input, indexMappingRow) {
      var gl = this.webgl.context;
      var nbPatches = input.shape[0];
      var patchLen = input.shape[1];
      var nbFilter = indexMappingRow.shape[1];
      var inputColPad = this.webgl.getPad(patchLen);
      var outputColPad = this.webgl.getPad(nbFilter);
      gl.uniform1i(gl.getUniformLocation(this.inputTransformProgram, WebGLConv2D.INPUT_ROWS_UNIFORM_NAME), nbPatches);
      gl.uniform1i(gl.getUniformLocation(this.inputTransformProgram, WebGLConv2D.INPUT_COLS_UNIFORM_NAME), patchLen);
      gl.uniform1i(gl.getUniformLocation(this.inputTransformProgram, WebGLConv2D.OUTPUT_COLS_UNIFORM_NAME), nbFilter);
      gl.uniform1i(gl.getUniformLocation(this.inputTransformProgram, WebGLConv2D.INPUT_COL_PAD_UNIFORM_NAME), inputColPad);
      gl.uniform1i(gl.getUniformLocation(this.inputTransformProgram, WebGLConv2D.OUTPUT_COL_PAD_UNIFORM_NAME), outputColPad);
    }

    /**
     * Bind WebGL uniforms for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} weights
     * @param {string} activation
     */

  }, {
    key: '_bindUniformsMain',
    value: function _bindUniformsMain(input, weights, activation) {
      var gl = this.webgl.context;
      var nbFilter = weights.shape[0];
      var patchLen = input.shape[1];
      var inputColPad = this.webgl.getPad(patchLen);
      var outputColPad = this.webgl.getPad(nbFilter);
      gl.uniform1i(gl.getUniformLocation(this.mainProgram, WebGLConv2D.INPUT_COLS_UNIFORM_NAME), patchLen);
      gl.uniform1i(gl.getUniformLocation(this.mainProgram, WebGLConv2D.OUTPUT_COLS_UNIFORM_NAME), nbFilter);
      gl.uniform1i(gl.getUniformLocation(this.mainProgram, WebGLConv2D.INPUT_COL_PAD_UNIFORM_NAME), inputColPad);
      gl.uniform1i(gl.getUniformLocation(this.mainProgram, WebGLConv2D.OUTPUT_COL_PAD_UNIFORM_NAME), outputColPad);
      if (activation === 'relu') {
        gl.uniform1i(gl.getUniformLocation(this.mainProgram, WebGLConv2D.RELU_ACTIVATION_UNIFORM_NAME), 1);
      }
    }

    /**
     * Bind WebGL output texture for input transform operation.
     *
     * @param {weblas.pipeline.Tensor} indexMappingRow
     * @param {weblas.pipeline.Tensor} inputTransformed
     */

  }, {
    key: '_bindOutputTextureInputTransform',
    value: function _bindOutputTextureInputTransform(indexMappingRow, inputTransformed) {
      var nbFilter = indexMappingRow.shape[1];
      var outputColPad = this.webgl.getPad(nbFilter);
      this.webgl.bindOutputTexture(indexMappingRow.shape[0], (nbFilter + outputColPad) / 4, inputTransformed.texture);
    }

    /**
     * Bind WebGL output texture for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} weights
     * @param {weblas.pipeline.Tensor} tOut
     */

  }, {
    key: '_bindOutputTextureMain',
    value: function _bindOutputTextureMain(input, weights, tOut) {
      var nbPatches = input.shape[0];
      var nbFilter = weights.shape[0];
      var outputColPad = this.webgl.getPad(nbFilter);
      this.webgl.bindOutputTexture(nbPatches, (nbFilter + outputColPad) / 4, tOut.texture);
    }

    /**
     * Transform input operation.
     * indexMappingRow and indexMappingCol contain index mappings on the encoded input
     * matrix.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} indexMappingRow
     * @param {weblas.pipeline.Tensor} indexMappingCol
     *
     * @returns {weblas.pipeline.Tensor}
     */

  }, {
    key: 'transformInput',
    value: function transformInput(input, indexMappingRow, indexMappingCol) {
      if (indexMappingRow.shape[0] !== indexMappingCol.shape[0] || indexMappingRow.shape[1] !== indexMappingCol.shape[1]) {
        throw new Error('Invalid indexMappingRow or indexMappingCol weblas tensor shapes.');
      }

      this.webgl.selectProgram(this.inputTransformProgram);

      var inputTransformed = new weblas.pipeline.Tensor(indexMappingRow.shape, null);

      this._bindInputTexturesInputTransform(input, indexMappingRow, indexMappingCol);
      this._bindUniformsInputTransform(input, indexMappingRow);
      this._bindOutputTextureInputTransform(indexMappingRow, inputTransformed);
      this._compute();
      this._unbindInputTextures();

      return inputTransformed;
    }

    /**
     * Main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} weights
     * @param {weblas.pipeline.Tensor} bias
     * @param {string} activation
     * @param {weblas.pipeline.Tensor} [indexMappingRow]
     * @param {weblas.pipeline.Tensor} [indexMappingCol]
     *
     * @returns {weblas.pipeline.Tensor}
     */

  }, {
    key: 'call',
    value: function call(input, weights, bias, activation, indexMappingRow, indexMappingCol) {
      if (indexMappingRow && indexMappingCol) {
        input = this.transformInput(input, indexMappingRow, indexMappingCol);
      }
      if (input.shape[1] !== weights.shape[1]) {
        throw new Error('Invalid input or weights weblas tensor shapes.');
      }

      this.webgl.selectProgram(this.mainProgram);

      var nbPatches = input.shape[0];
      var nbFilter = weights.shape[0];

      // create an empty output Tensor
      var tOut = new weblas.pipeline.Tensor([nbPatches, nbFilter], null);

      this._bindInputTexturesMain(input, weights, bias);
      this._bindUniformsMain(input, weights, activation);
      this._bindOutputTextureMain(input, weights, tOut);
      this._compute();
      this._unbindInputTextures();

      return tOut;
    }
  }]);

  return WebGLConv2D;
}(_WebGLLayer3.default);

WebGLConv2D.INPUT_TEXTURE_NAME = 'X';
WebGLConv2D.WEIGHTS_TEXTURE_NAME = 'W';
WebGLConv2D.BIAS_TEXTURE_NAME = 'b';
WebGLConv2D.INPUT_ROWS_UNIFORM_NAME = 'inputRows';
WebGLConv2D.INPUT_COLS_UNIFORM_NAME = 'inputCols';
WebGLConv2D.OUTPUT_COLS_UNIFORM_NAME = 'outputCols';
WebGLConv2D.INPUT_COL_PAD_UNIFORM_NAME = 'inputColPad';
WebGLConv2D.OUTPUT_COL_PAD_UNIFORM_NAME = 'outputColPad';
WebGLConv2D.RELU_ACTIVATION_UNIFORM_NAME = 'relu';
WebGLConv2D.IMAP_ROW_TEXTURE_NAME = 'indexMappingRow';
WebGLConv2D.IMAP_COL_TEXTURE_NAME = 'indexMappingCol';
exports.default = WebGLConv2D;