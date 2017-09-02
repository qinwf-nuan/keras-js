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

var WebGLBatchNorm = function (_WebGLLayer) {
  _inherits(WebGLBatchNorm, _WebGLLayer);

  function WebGLBatchNorm() {
    _classCallCheck(this, WebGLBatchNorm);

    var _this = _possibleConstructorReturn(this, (WebGLBatchNorm.__proto__ || Object.getPrototypeOf(WebGLBatchNorm)).call(this));

    _this.program = _this.webgl.createProgram(require('./batchnorm.glsl'));
    return _this;
  }

  _createClass(WebGLBatchNorm, [{
    key: '_bindInputTextures',


    /**
     * Bind WebGL input textures for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} gamma
     * @param {weblas.pipeline.Tensor} beta
     * @param {weblas.pipeline.Tensor} mean
     * @param {weblas.pipeline.Tensor} std
     */
    value: function _bindInputTextures(input, gamma, beta, mean, std) {
      var gl = this.webgl.context;
      this.numTextures = 5;
      this._bindInputTexture(this.program, input.texture, gl.TEXTURE0, WebGLBatchNorm.INPUT_TEXTURE_NAME);
      this._bindInputTexture(this.program, mean.texture, gl.TEXTURE1, WebGLBatchNorm.MEAN_TEXTURE_NAME);
      this._bindInputTexture(this.program, std.texture, gl.TEXTURE2, WebGLBatchNorm.STD_TEXTURE_NAME);
      this._bindInputTexture(this.program, gamma.texture, gl.TEXTURE3, WebGLBatchNorm.GAMMA_TEXTURE_NAME);
      this._bindInputTexture(this.program, beta.texture, gl.TEXTURE4, WebGLBatchNorm.BETA_TEXTURE_NAME);
    }

    /**
     * Bind WebGL uniforms for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {number} epsilon
     */

  }, {
    key: '_bindUniforms',
    value: function _bindUniforms(input, epsilon) {
      var gl = this.webgl.context;
      var outputColPad = this.webgl.getPad(input.shape[1]);
      gl.uniform1f(gl.getUniformLocation(this.program, WebGLBatchNorm.EPSILON_UNIFORM_NAME), epsilon);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLBatchNorm.OUTPUT_COLS_UNIFORM_NAME), input.shape[1]);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLBatchNorm.OUTPUT_COL_PAD_UNIFORM_NAME), outputColPad);
    }

    /**
     * Bind WebGL output texture for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} tOut
     */

  }, {
    key: '_bindOutputTexture',
    value: function _bindOutputTexture(input, tOut) {
      var outputColPad = this.webgl.getPad(input.shape[1]);
      this.webgl.bindOutputTexture(input.shape[0], (input.shape[1] + outputColPad) / 4, tOut.texture);
    }

    /**
     * Main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {number} epsilon
     * @param {weblas.pipeline.Tensor} gamma
     * @param {weblas.pipeline.Tensor} beta
     * @param {weblas.pipeline.Tensor} [mean]
     * @param {weblas.pipeline.Tensor} [std]
     *
     * @returns {weblas.pipeline.Tensor}
     */

  }, {
    key: 'call',
    value: function call(input, epsilon, gamma, beta, mean, std) {
      this.webgl.selectProgram(this.program);

      // create an empty output Tensor
      var tOut = new weblas.pipeline.Tensor(input.shape, null);

      this._bindInputTextures(input, gamma, beta, mean, std);
      this._bindUniforms(input, epsilon);
      this._bindOutputTexture(input, tOut);
      this._compute();
      this._unbindInputTextures();

      return tOut;
    }
  }]);

  return WebGLBatchNorm;
}(_WebGLLayer3.default);

WebGLBatchNorm.INPUT_TEXTURE_NAME = 'X';
WebGLBatchNorm.MEAN_TEXTURE_NAME = 'mean';
WebGLBatchNorm.STD_TEXTURE_NAME = 'std';
WebGLBatchNorm.GAMMA_TEXTURE_NAME = 'gamma';
WebGLBatchNorm.BETA_TEXTURE_NAME = 'beta';
WebGLBatchNorm.EPSILON_UNIFORM_NAME = 'epsilon';
WebGLBatchNorm.OUTPUT_COLS_UNIFORM_NAME = 'outputCols';
WebGLBatchNorm.OUTPUT_COL_PAD_UNIFORM_NAME = 'outputColPad';
exports.default = WebGLBatchNorm;