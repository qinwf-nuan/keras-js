'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Conv2D = require('./Conv2D');

var _Conv2D2 = _interopRequireDefault(_Conv2D);

var _ndarraySqueeze = require('ndarray-squeeze');

var _ndarraySqueeze2 = _interopRequireDefault(_ndarraySqueeze);

var _ndarrayUnsqueeze = require('ndarray-unsqueeze');

var _ndarrayUnsqueeze2 = _interopRequireDefault(_ndarrayUnsqueeze);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Conv1D layer class
 */
var Conv1D = function (_Layer) {
  _inherits(Conv1D, _Layer);

  /**
   * Creates a Conv1D layer
   * @param {Number} attrs.filters - Number of convolution filters to use.
   * @param {Number} attrs.kernel_size - Length of 1D convolution kernel.
   * @param {Object} [attrs] - layer attributes
   */
  function Conv1D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Conv1D);

    var _this = _possibleConstructorReturn(this, (Conv1D.__proto__ || Object.getPrototypeOf(Conv1D)).call(this, attrs));

    _this.layerClass = 'Conv1D';

    var _attrs$filters = attrs.filters,
        filters = _attrs$filters === undefined ? 1 : _attrs$filters,
        _attrs$kernel_size = attrs.kernel_size,
        kernel_size = _attrs$kernel_size === undefined ? 1 : _attrs$kernel_size,
        _attrs$strides = attrs.strides,
        strides = _attrs$strides === undefined ? 1 : _attrs$strides,
        _attrs$padding = attrs.padding,
        padding = _attrs$padding === undefined ? 'valid' : _attrs$padding,
        _attrs$dilation_rate = attrs.dilation_rate,
        dilation_rate = _attrs$dilation_rate === undefined ? 1 : _attrs$dilation_rate,
        _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'linear' : _attrs$activation,
        _attrs$use_bias = attrs.use_bias,
        use_bias = _attrs$use_bias === undefined ? true : _attrs$use_bias;


    if (padding !== 'valid' && padding !== 'same') {
      throw new Error(`${_this.name} [Conv1D layer] Invalid padding.`);
    }

    if (dilation_rate !== 1 && strides !== 1) {
      // Currently, specifying any dilation_rate value != 1 is incompatible with specifying any stride value != 1
      // https://keras.io/layers/convolutional/#conv1d
      throw new Error(`${_this.name} [Conv1D layer] Incompatible combination of dilation_rate with strides.`);
    }

    _this.use_bias = use_bias;

    // Layer weights specification
    _this.params = _this.use_bias ? ['kernel', 'bias'] : ['kernel'];

    // Bootstrap Conv2D layer:
    // Conv1D is actually a shim on top of Conv2D, where
    // all of the computational action is performed
    // Note that we use `channels_first` dim ordering here.
    var conv2dAttrs = {
      filters,
      kernel_size: [kernel_size, 1],
      strides: [strides, 1],
      padding,
      data_format: 'channels_first',
      dilation_rate,
      activation,
      use_bias
    };
    _this._conv2dAttrs = conv2dAttrs;
    _this._conv2d = new _Conv2D2.default(Object.assign(conv2dAttrs, { gpu: attrs.gpu }));
    return _this;
  }

  /**
   * Method for setting layer weights
   * Override `super` method since weights must be set in `this._conv2d`
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(Conv1D, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      weightsArr[0].tensor = (0, _ndarrayUnsqueeze2.default)(weightsArr[0].tensor).transpose(2, 1, 0, 3);
      this._conv2d.setWeights(weightsArr);
    }

    /**
     * Layer computational logic
     *
     * @param {Tensor} x
     * @returns {Tensor}
     */

  }, {
    key: 'call',
    value: function call(x) {
      x.tensor = (0, _ndarrayUnsqueeze2.default)(x.tensor).transpose(0, 2, 1);
      var conv2dOutput = this._conv2d.call(x);
      x.tensor = (0, _ndarraySqueeze2.default)(conv2dOutput.tensor).transpose(1, 0, 2);
      return x;
    }
  }]);

  return Conv1D;
}(_Layer3.default);

exports.default = Conv1D;