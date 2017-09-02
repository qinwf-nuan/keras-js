'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Pooling1D3 = require('./_Pooling1D');

var _Pooling1D4 = _interopRequireDefault(_Pooling1D3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * AveragePooling1D layer class, extends abstract _Pooling1D class
 */
var AveragePooling1D = function (_Pooling1D2) {
  _inherits(AveragePooling1D, _Pooling1D2);

  /**
   * Creates a AveragePooling1D layer
   */
  function AveragePooling1D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AveragePooling1D);

    var _this = _possibleConstructorReturn(this, (AveragePooling1D.__proto__ || Object.getPrototypeOf(AveragePooling1D)).call(this, attrs));

    _this.layerClass = 'AveragePooling1D';

    _this.poolingFunc = 'average';
    return _this;
  }

  return AveragePooling1D;
}(_Pooling1D4.default);

exports.default = AveragePooling1D;