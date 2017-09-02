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
 * GlobalMaxPooling2D layer class
 */
var GlobalMaxPooling2D = function (_Layer) {
  _inherits(GlobalMaxPooling2D, _Layer);

  /**
   * Creates a GlobalMaxPooling2D layer
   */
  function GlobalMaxPooling2D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, GlobalMaxPooling2D);

    var _this = _possibleConstructorReturn(this, (GlobalMaxPooling2D.__proto__ || Object.getPrototypeOf(GlobalMaxPooling2D)).call(this, attrs));

    _this.layerClass = 'GlobalMaxPooling2D';

    var _attrs$data_format = attrs.data_format,
        data_format = _attrs$data_format === undefined ? 'channels_last' : _attrs$data_format;

    _this.dataFormat = data_format;
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(GlobalMaxPooling2D, [{
    key: 'call',
    value: function call(x) {
      // convert to channels_last ordering
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(1, 2, 0);
      }

      var channels = x.tensor.shape[2];
      var y = new _Tensor2.default([], [channels]);
      for (var i = 0, len = channels; i < len; i++) {
        y.tensor.set(i, _ndarrayOps2.default.sup(x.tensor.pick(null, null, i)));
      }
      x.tensor = y.tensor;
      return x;
    }
  }]);

  return GlobalMaxPooling2D;
}(_Layer3.default);

exports.default = GlobalMaxPooling2D;