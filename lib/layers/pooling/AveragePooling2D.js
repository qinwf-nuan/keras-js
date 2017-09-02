'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Pooling2D3 = require('./_Pooling2D');

var _Pooling2D4 = _interopRequireDefault(_Pooling2D3);

var _checkPipelineSupport = require('../../utils/checkPipelineSupport');

var _checkPipelineSupport2 = _interopRequireDefault(_checkPipelineSupport);

var _WebGLPooling2D = require('../../webgl/pooling/WebGLPooling2D');

var _WebGLPooling2D2 = _interopRequireDefault(_WebGLPooling2D);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * AveragePooling2D layer class, extends abstract _Pooling2D class
 */
var AveragePooling2D = function (_Pooling2D2) {
  _inherits(AveragePooling2D, _Pooling2D2);

  /**
   * Creates a AveragePooling2D layer
   */
  function AveragePooling2D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AveragePooling2D);

    var _this = _possibleConstructorReturn(this, (AveragePooling2D.__proto__ || Object.getPrototypeOf(AveragePooling2D)).call(this, attrs));

    _this.layerClass = 'AveragePooling2D';

    _this.poolingFunc = 'average';

    // Enable layer gpu +/- pipeline mode if supported
    if (_this.gpu && weblas) {
      _this._useWeblas = true;
      if (_this.pipeline) {
        var isPipelineModeSupported = (0, _checkPipelineSupport2.default)(_this.layerClass, attrs);
        if (isPipelineModeSupported) {
          _this._pipelineEnabled = true;
          _this.webglPooling2D = new _WebGLPooling2D2.default(_this.poolingFunc);
        } else {
          _this._pipelineEnabled = false;
        }
      }
    }
    return _this;
  }

  return AveragePooling2D;
}(_Pooling2D4.default);

exports.default = AveragePooling2D;