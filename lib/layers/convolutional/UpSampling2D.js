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
 * UpSampling2D layer class
 */
var UpSampling2D = function (_Layer) {
  _inherits(UpSampling2D, _Layer);

  /**
   * Creates a UpSampling2D layer
   * @param {Number|Array<Number>} attrs.size - upsampling factor, int or tuple of int (length 2)
   * @param {String} attrs.data_format - either 'channels_last' or 'channels_first'
   */
  function UpSampling2D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, UpSampling2D);

    var _this = _possibleConstructorReturn(this, (UpSampling2D.__proto__ || Object.getPrototypeOf(UpSampling2D)).call(this, attrs));

    _this.layerClass = 'UpSampling2D';

    var _attrs$size = attrs.size,
        size = _attrs$size === undefined ? [2, 2] : _attrs$size,
        _attrs$data_format = attrs.data_format,
        data_format = _attrs$data_format === undefined ? 'channels_last' : _attrs$data_format;


    if (Array.isArray(size)) {
      _this.size = size;
    } else {
      _this.size = [size, size];
    }

    _this.dataFormat = data_format;
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(UpSampling2D, [{
    key: 'call',
    value: function call(x) {
      // convert to channels_last ordering
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(1, 2, 0);
      }

      var inputShape = x.tensor.shape;
      var outputShape = [inputShape[0] * this.size[0], inputShape[1] * this.size[1], inputShape[2]];
      var y = new _Tensor2.default([], outputShape);
      for (var i = 0; i < this.size[0]; i++) {
        for (var j = 0; j < this.size[1]; j++) {
          _ndarrayOps2.default.assign(y.tensor.lo(i, j, 0).step(this.size[0], this.size[1], 1), x.tensor);
        }
      }
      x.tensor = y.tensor;

      // convert back to channels_first ordering if necessary
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(2, 0, 1);
      }

      return x;
    }
  }]);

  return UpSampling2D;
}(_Layer3.default);

exports.default = UpSampling2D;