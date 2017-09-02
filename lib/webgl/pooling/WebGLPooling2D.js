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

var WebGLPooling2D = function (_WebGLLayer) {
  _inherits(WebGLPooling2D, _WebGLLayer);

  function WebGLPooling2D(poolingFunc) {
    _classCallCheck(this, WebGLPooling2D);

    var _this = _possibleConstructorReturn(this, (WebGLPooling2D.__proto__ || Object.getPrototypeOf(WebGLPooling2D)).call(this));

    if (poolingFunc === 'max') {
      _this.program = _this.webgl.createProgram(require('./maxpooling2d.glsl'));
    } else if (poolingFunc === 'average') {
      _this.program = _this.webgl.createProgram(require('./avgpooling2d.glsl'));
    } else {
      throw new Error(`[WebGLPooling2D] pooling function must be max or average.`);
    }
    return _this;
  }

  _createClass(WebGLPooling2D, [{
    key: '_bindInputTextures',


    /**
     * Bind WebGL input textures for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} poolIndexMapping
     */
    value: function _bindInputTextures(input, poolIndexMapping) {
      var gl = this.webgl.context;
      this.numTextures = 2;
      this._bindInputTexture(this.program, input.texture, gl.TEXTURE0, WebGLPooling2D.INPUT_TEXTURE_NAME);
      this._bindInputTexture(this.program, poolIndexMapping.texture, gl.TEXTURE1, WebGLPooling2D.POOL_IMAP_TEXTURE_NAME);
    }

    /**
     * Bind WebGL uniforms for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} poolIndexMapping
     */

  }, {
    key: '_bindUniforms',
    value: function _bindUniforms(input, poolIndexMapping) {
      var gl = this.webgl.context;
      var nbPatches = input.shape[0];
      var channels = input.shape[1];
      var channelsPad = this.webgl.getPad(channels);
      var poolElements = poolIndexMapping.shape[1];
      var poolElementsPad = this.webgl.getPad(poolElements);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLPooling2D.INPUT_ROWS_UNIFORM_NAME), nbPatches);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLPooling2D.CHANNELS_UNIFORM_NAME), channels);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLPooling2D.CHANNELS_PAD_UNIFORM_NAME), channelsPad);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLPooling2D.POOL_ELEMENTS_UNIFORM_NAME), poolElements);
      gl.uniform1i(gl.getUniformLocation(this.program, WebGLPooling2D.POOL_ELEMENTS_PAD_UNIFORM_NAME), poolElementsPad);
    }

    /**
     * Bind WebGL output texture for main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} poolIndexMapping
     * @param {weblas.pipeline.Tensor} tOut
     */

  }, {
    key: '_bindOutputTexture',
    value: function _bindOutputTexture(input, poolIndexMapping, tOut) {
      var outputLength = poolIndexMapping.shape[0];
      var channels = input.shape[1];
      var outputCols = this.webgl.getPad(channels);
      this.webgl.bindOutputTexture(outputLength, (channels + outputCols) / 4, tOut.texture);
    }

    /**
     * Main operation.
     *
     * @param {weblas.pipeline.Tensor} input
     * @param {weblas.pipeline.Tensor} poolIndexMapping
     *
     * @returns {weblas.pipeline.Tensor}
     */

  }, {
    key: 'call',
    value: function call(input, poolIndexMapping) {
      this.webgl.selectProgram(this.program);

      // create an empty output Tensor
      var outputLength = poolIndexMapping.shape[0];
      var channels = input.shape[1];
      var tOut = new weblas.pipeline.Tensor([outputLength, channels], null);

      this._bindInputTextures(input, poolIndexMapping);
      this._bindUniforms(input, poolIndexMapping);
      this._bindOutputTexture(input, poolIndexMapping, tOut);
      this._compute();
      this._unbindInputTextures();

      return tOut;
    }
  }]);

  return WebGLPooling2D;
}(_WebGLLayer3.default);

WebGLPooling2D.INPUT_TEXTURE_NAME = 'X';
WebGLPooling2D.POOL_IMAP_TEXTURE_NAME = 'poolIndexMapping';
WebGLPooling2D.INPUT_ROWS_UNIFORM_NAME = 'inputRows';
WebGLPooling2D.CHANNELS_UNIFORM_NAME = 'channels';
WebGLPooling2D.CHANNELS_PAD_UNIFORM_NAME = 'channelsPad';
WebGLPooling2D.POOL_ELEMENTS_UNIFORM_NAME = 'poolElements';
WebGLPooling2D.POOL_ELEMENTS_PAD_UNIFORM_NAME = 'poolElementsPad';
exports.default = WebGLPooling2D;