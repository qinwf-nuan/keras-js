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
 * GlobalMaxPooling1D layer class
 */
var GlobalMaxPooling1D = function (_Layer) {
  _inherits(GlobalMaxPooling1D, _Layer);

  /**
   * Creates a GlobalMaxPooling1D layer
   */
  function GlobalMaxPooling1D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, GlobalMaxPooling1D);

    var _this = _possibleConstructorReturn(this, (GlobalMaxPooling1D.__proto__ || Object.getPrototypeOf(GlobalMaxPooling1D)).call(this, attrs));

    _this.layerClass = 'GlobalMaxPooling1D';
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(GlobalMaxPooling1D, [{
    key: 'call',
    value: function call(x) {
      var features = x.tensor.shape[1];
      var y = new _Tensor2.default([], [features]);
      for (var i = 0, len = features; i < len; i++) {
        y.tensor.set(i, _ndarrayOps2.default.sup(x.tensor.pick(null, i)));
      }
      x.tensor = y.tensor;
      return x;
    }
  }]);

  return GlobalMaxPooling1D;
}(_Layer3.default);

exports.default = GlobalMaxPooling1D;