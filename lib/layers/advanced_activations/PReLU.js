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

var _cwise = require('cwise');

var _cwise2 = _interopRequireDefault(_cwise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * PReLU advanced activation layer class
 * reference code:
 * ```
 * pos = K.relu(x)
 * neg = self.alpha * (x - abs(x)) * 0.5
 * return pos + neg
 * ```
 */
var PReLU = function (_Layer) {
  _inherits(PReLU, _Layer);

  /**
   * Creates a PReLU activation layer
   */
  function PReLU() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PReLU);

    var _this = _possibleConstructorReturn(this, (PReLU.__proto__ || Object.getPrototypeOf(PReLU)).call(this, attrs));

    _this._compute = (0, _cwise2.default)({
      args: ['array', 'array'],
      body: function body(_x, alpha) {
        _x = Math.max(_x, 0) + alpha * Math.min(_x, 0);
      }
    });

    _this.layerClass = 'PReLU';

    // Layer weights specification
    _this.params = ['alpha'];

    // GPU setup
    if (_this.gpu) {
      _this.program = _WebGL.webgl2.compileProgram(require('./PReLU.webgl2.glsl'));
    }
    return _this;
  }

  _createClass(PReLU, [{
    key: 'call',


    /**
     * Layer computational logic
     *
     * @param {Tensor} x
     * @returns {Tensor}
     */
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
      this._compute(this.output.tensor, this.weights['alpha'].tensor);
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
      var textures = [x.glTexture, this.weights['alpha'].glTexture];
      var textureTypes = ['2d', '2d'];
      var textureNames = ['x', 'alpha'];
      _WebGL.webgl2.bindInputTextures(this.program, textures, textureTypes, textureNames);
      _WebGL.webgl2.runProgram();

      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
      }
    }
  }]);

  return PReLU;
}(_Layer3.default);

exports.default = PReLU;