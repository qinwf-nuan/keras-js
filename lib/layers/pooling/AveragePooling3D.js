'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Pooling3D3 = require('./_Pooling3D');

var _Pooling3D4 = _interopRequireDefault(_Pooling3D3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * AveragePooling3D layer class, extends abstract _Pooling3D class
 */
var AveragePooling3D = function (_Pooling3D2) {
  _inherits(AveragePooling3D, _Pooling3D2);

  /**
   * Creates a AveragePooling3D layer
   */
  function AveragePooling3D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AveragePooling3D);

    var _this = _possibleConstructorReturn(this, (AveragePooling3D.__proto__ || Object.getPrototypeOf(AveragePooling3D)).call(this, attrs));

    _this.layerClass = 'AveragePooling3D';

    _this.poolingFunc = 'average';
    return _this;
  }

  return AveragePooling3D;
}(_Pooling3D4.default);

exports.default = AveragePooling3D;