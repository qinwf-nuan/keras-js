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
 * Cropping2D layer class
 */
var Cropping2D = function (_Layer) {
  _inherits(Cropping2D, _Layer);

  /**
   * Creates a Cropping2D layer
   * @param {Number|Array<Number>|Array<Array<Number>>} attrs.cropping - int, or tuple of 2 ints, or tuple of 2 tuples of 2 ints
   * @param {String} attrs.data_format - either 'channels_last' or 'channels_first'
   */
  function Cropping2D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Cropping2D);

    var _this = _possibleConstructorReturn(this, (Cropping2D.__proto__ || Object.getPrototypeOf(Cropping2D)).call(this, attrs));

    _this.layerClass = 'Cropping2D';

    var _attrs$cropping = attrs.cropping,
        cropping = _attrs$cropping === undefined ? [[0, 0], [0, 0]] : _attrs$cropping,
        _attrs$data_format = attrs.data_format,
        data_format = _attrs$data_format === undefined ? 'channels_last' : _attrs$data_format;


    if (Array.isArray(cropping)) {
      if (Array.isArray(cropping[0])) {
        // [[int, int], [int, int]]
        _this.cropping = cropping;
      } else {
        // [int, int]
        _this.cropping = [[cropping[0], cropping[0]], [cropping[1], cropping[1]]];
      }
    } else {
      // int
      _this.cropping = [[cropping, cropping], [cropping, cropping]];
    }

    _this.dataFormat = data_format;
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(Cropping2D, [{
    key: 'call',
    value: function call(x) {
      // convert to channels_last ordering
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(1, 2, 0);
      }

      var inputShape = x.tensor.shape;
      var outputShape = [inputShape[0] - this.cropping[0][0] - this.cropping[0][1], inputShape[1] - this.cropping[1][0] - this.cropping[1][1], inputShape[2]];
      var y = new _Tensor2.default([], outputShape);
      _ndarrayOps2.default.assign(y.tensor, x.tensor.hi(inputShape[0] - this.cropping[0][1], inputShape[1] - this.cropping[1][1], inputShape[2]).lo(this.cropping[0][0], this.cropping[1][0], 0));
      x.tensor = y.tensor;

      // convert back to channels_first ordering if necessary
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(2, 0, 1);
      }

      return x;
    }
  }]);

  return Cropping2D;
}(_Layer3.default);

exports.default = Cropping2D;