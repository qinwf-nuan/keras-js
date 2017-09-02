'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * ZeroPadding1D layer class
 */
var ZeroPadding1D = function (_Layer) {
  _inherits(ZeroPadding1D, _Layer);

  /**
   * Creates a ZeroPadding1D layer
   * @param {Number|Array<Number>} attrs.padding - int or tuple of int (length 2)
   */
  function ZeroPadding1D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ZeroPadding1D);

    var _this = _possibleConstructorReturn(this, (ZeroPadding1D.__proto__ || Object.getPrototypeOf(ZeroPadding1D)).call(this, attrs));

    _this.layerClass = 'ZeroPadding1D';

    var _attrs$padding = attrs.padding,
        padding = _attrs$padding === undefined ? [1, 1] : _attrs$padding;


    if (Array.isArray(padding)) {
      _this.padding = padding;
    } else {
      _this.padding = [padding, padding];
    }
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(ZeroPadding1D, [{
    key: 'call',
    value: function call(x) {
      var inputShape = x.tensor.shape;
      var outputShape = [inputShape[0] + this.padding[0] + this.padding[1], inputShape[1]];
      var y = new _Tensor2.default([], outputShape);
      _ndarrayOps2.default.assign(y.tensor.hi(inputShape[0] + this.padding[0], inputShape[1]).lo(this.padding[0], 0), x.tensor);
      x.tensor = y.tensor;
      return x;
    }
  }]);

  return ZeroPadding1D;
}(_Layer3.default);

exports.default = ZeroPadding1D;