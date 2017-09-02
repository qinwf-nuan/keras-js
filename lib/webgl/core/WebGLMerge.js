'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WebGLLayer2 = require('../WebGLLayer');

var _WebGLLayer3 = _interopRequireDefault(_WebGLLayer2);

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

var _sum = require('lodash/sum');

var _sum2 = _interopRequireDefault(_sum);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MODE_CODE = { sum: 0, mul: 1, concat: 2, ave: 3, max: 4 };

var WebGLMerge = function (_WebGLLayer) {
  _inherits(WebGLMerge, _WebGLLayer);

  function WebGLMerge(mode) {
    _classCallCheck(this, WebGLMerge);

    var _this = _possibleConstructorReturn(this, (WebGLMerge.__proto__ || Object.getPrototypeOf(WebGLMerge)).call(this));

    if (mode === 'concat') {
      _this.program = _this.webgl.createProgram(require('./merge_concat.glsl'));
    } else if (['sum', 'mul', 'ave', 'max'].indexOf(mode) > -1) {
      _this.program = _this.webgl.createProgram(require('./merge.glsl'));
    } else {
      throw new Error(`${mode} mode currently not supported in WebGLMerge layer.`);
    }

    _this.mode = mode;
    _this.modeCode = MODE_CODE[mode];
    return _this;
  }

  _createClass(WebGLMerge, [{
    key: '_bindInputTexturesArray',


    /**
     * Bind WebGL input textures array with a single uniform name.
     *
     * @param {weblas.pipeline.Tensor[]} inputs
     */
    value: function _bindInputTexturesArray(inputs) {
      if (inputs.length > this.MAX_NUM_TEXTURES) {
        throw new Error('Max number of inputs to WebGLMerge exceeded.');
      }

      var gl = this.webgl.context;
      this.numTextures = inputs.length;

      for (var i = 0; i < inputs.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, inputs[i].texture);
      }

      var sampler = gl.getUniformLocation(this.program, `${WebGLMerge.INPUT_TEXTURES_ARRAY_NAME}[0]`);
      gl.uniform1iv(sampler, (0, _range2.default)(this.numTextures));
    }

    /**
     * Bind WebGL uniforms for main operation.
     *
     * @param {weblas.pipeline.Tensor[]} inputs
     */

  }, {
    key: '_bindUniforms',
    value: function _bindUniforms(inputs) {
      var gl = this.webgl.context;

      var outputCols = inputs[0].shape[1];
      var outputColPad = this.webgl.getPad(outputCols);

      gl.uniform1i(gl.getUniformLocation(this.program, WebGLMerge.NUM_INPUTS_UNIFORM_NAME), inputs.length);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLMerge.OUTPUT_COLS_UNIFORM_NAME), outputCols);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLMerge.OUTPUT_COL_PAD_UNIFORM_NAME), outputColPad);

      if (this.mode === 'concat') {
        // with concat, inputs are first transposed to be channel-first
        var inputChannelStartIndices = inputs.map(function (x) {
          return x.shape[0];
        }).reduce(function (arr, dim) {
          if (arr.length > 1) {
            dim += arr[arr.length - 1];
          }
          arr.push(dim);
          return arr;
        }, [0]).slice(0, -1);

        var outputRows = (0, _sum2.default)(inputs.map(function (x) {
          return x.shape[0];
        }));
        gl.uniform1i(gl.getUniformLocation(this.program, WebGLMerge.OUTPUT_ROWS_UNIFORM_NAME), outputRows);
        gl.uniform1iv(gl.getUniformLocation(this.program, WebGLMerge.INPUT_CHANNEL_START_INDICES_UNIFORM_NAME), inputChannelStartIndices);
      } else {
        gl.uniform1i(gl.getUniformLocation(this.program, WebGLMerge.MODE_CODE_UNIFORM_NAME), this.modeCode);
      }
    }

    /**
     * Bind WebGL output texture for main operation.
     *
     * @param {weblas.pipeline.Tensor[]} inputs
     * @param {weblas.pipeline.Tensor} tOut
     */

  }, {
    key: '_bindOutputTexture',
    value: function _bindOutputTexture(inputs, tOut) {
      var outputRows = inputs[0].shape[0];
      if (this.mode === 'concat') {
        outputRows = (0, _sum2.default)(inputs.map(function (x) {
          return x.shape[0];
        }));
      }
      var outputCols = inputs[0].shape[1];
      var outputColPad = this.webgl.getPad(outputCols);
      this.webgl.bindOutputTexture(outputRows, (outputCols + outputColPad) / 4, tOut.texture);
    }

    /**
     * Main operation.
     *
     * @param {weblas.pipeline.Tensor[]} inputs
     * @returns {weblas.pipeline.Tensor}
     */

  }, {
    key: 'call',
    value: function call(inputs) {
      this.webgl.selectProgram(this.program);

      // create an empty output Tensor
      var tOut = void 0;
      if (this.mode === 'concat') {
        // concat along channel axis
        if (!inputs.every(function (x) {
          return x.shape[0] === inputs[0].shape[0];
        })) {
          throw new Error('Non-concat axis dimension of inputs to WebGLMerge must all be the same.');
        }
        // for fragment shader ease-of-operation, we first transpose weblas tensors
        // into shape with channels as rows
        var inputsTransposed = inputs.map(function (x) {
          return x.transpose();
        });
        var newShape = [(0, _sum2.default)(inputsTransposed.map(function (x) {
          return x.shape[0];
        })), inputsTransposed[0].shape[1]];
        tOut = new weblas.pipeline.Tensor(newShape, null);

        // must select WebGL program again since differen program was loaded during transpose
        this.webgl.selectProgram(this.program);

        this._bindInputTexturesArray(inputsTransposed);
        this._bindUniforms(inputsTransposed);
        this._bindOutputTexture(inputsTransposed, tOut);
      } else {
        tOut = new weblas.pipeline.Tensor(inputs[0].shape, null);

        this._bindInputTexturesArray(inputs);
        this._bindUniforms(inputs);
        this._bindOutputTexture(inputs, tOut);
      }

      this._compute();
      this._unbindInputTextures();

      if (this.mode === 'concat') {
        // re-transpose weblas tensor into shape with channels as columns
        tOut = tOut.transpose();
      }

      return tOut;
    }
  }]);

  return WebGLMerge;
}(_WebGLLayer3.default);

WebGLMerge.INPUT_TEXTURES_ARRAY_NAME = 'inputs';
WebGLMerge.INPUT_CHANNEL_START_INDICES_UNIFORM_NAME = 'inputChannelStartIndices';
WebGLMerge.NUM_INPUTS_UNIFORM_NAME = 'numInputs';
WebGLMerge.MODE_CODE_UNIFORM_NAME = 'modeCode';
WebGLMerge.OUTPUT_ROWS_UNIFORM_NAME = 'outputRows';
WebGLMerge.OUTPUT_COLS_UNIFORM_NAME = 'outputCols';
WebGLMerge.OUTPUT_COL_PAD_UNIFORM_NAME = 'outputColPad';
exports.default = WebGLMerge;