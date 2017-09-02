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

var WebGLActivation = function (_WebGLLayer) {
  _inherits(WebGLActivation, _WebGLLayer);

  function WebGLActivation() {
    _classCallCheck(this, WebGLActivation);

    var _this = _possibleConstructorReturn(this, (WebGLActivation.__proto__ || Object.getPrototypeOf(WebGLActivation)).call(this));

    _this.program = _this.webgl.createProgram(require('./activation.glsl'));
    return _this;
  }

  _createClass(WebGLActivation, [{
    key: '_bindInputTextures',


    /**
     * Bind WebGL input textures.
     *
     * @param {weblas.pipeline.Tensor} input
     */
    value: function _bindInputTextures(input) {
      var gl = this.webgl.context;
      this.numTextures = 1;
      this._bindInputTexture(this.program, input.texture, gl.TEXTURE0, WebGLActivation.INPUT_TEXTURE_NAME);
    }

    /**
     * Bind WebGL uniforms.
     *
     * @param {string} activation
     */

  }, {
    key: '_bindUniforms',
    value: function _bindUniforms(activation) {
      var gl = this.webgl.context;
      if (activation === 'relu') {
        gl.uniform1i(gl.getUniformLocation(this.program, WebGLActivation.RELU_ACTIVATION_UNIFORM_NAME), 1);
      }
    }

    /**
     * Bind WebGL output texture.
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
     * @param {string} activation
     *
     * @returns {weblas.pipeline.Tensor}
     */

  }, {
    key: 'call',
    value: function call(input, activation) {
      this.webgl.selectProgram(this.program);

      // create an empty output Tensor
      var tOut = new weblas.pipeline.Tensor(input.shape, null);

      this._bindInputTextures(input);
      this._bindUniforms(activation);
      this._bindOutputTexture(input, tOut);
      this._compute();
      this._unbindInputTextures();

      return tOut;
    }
  }]);

  return WebGLActivation;
}(_WebGLLayer3.default);

WebGLActivation.INPUT_TEXTURE_NAME = 'X';
WebGLActivation.RELU_ACTIVATION_UNIFORM_NAME = 'relu';
exports.default = WebGLActivation;