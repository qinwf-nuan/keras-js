'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _activations = require('../../activations');

var activations = _interopRequireWildcard(_activations);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _ndarrayBlasLevel = require('ndarray-blas-level2');

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _cwise = require('cwise');

var _cwise2 = _interopRequireDefault(_cwise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Highway layer class
 * From Keras docs: Densely connected highway network, a natural extension of LSTMs to feedforward networks.
 */
var Highway = function (_Layer) {
  _inherits(Highway, _Layer);

  /**
   * Creates a Highway layer
   * @param {number} outputDim - output dimension size
   * @param {Object} [attrs] - layer attributes
   */
  function Highway() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Highway);

    var _this = _possibleConstructorReturn(this, (Highway.__proto__ || Object.getPrototypeOf(Highway)).call(this, attrs));

    _this._computeOutput = (0, _cwise2.default)({
      args: ['array', 'array', 'array'],
      body: function body(_x, _y, _transform) {
        _x = _y * _transform + (1 - _transform) * _x;
      }
    });

    _this.layerClass = 'Highway';

    var _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'linear' : _attrs$activation,
        _attrs$bias = attrs.bias,
        bias = _attrs$bias === undefined ? true : _attrs$bias;


    _this.activation = activation;
    _this.activationFunc = activations[activation];

    _this.bias = bias;

    /**
     * Layer weights specification
     */
    _this.params = _this.bias ? ['W', 'W_carry', 'b', 'b_carry'] : ['W', 'W_carry'];
    return _this;
  }

  _createClass(Highway, [{
    key: 'call',


    /**
     * Method for layer computational logic
     * @param {Tensor} x
     * @returns {Tensor} x
     */
    value: function call(x) {
      var y = new _Tensor2.default([], [this.weights.W.tensor.shape[1]]);
      if (this.bias) {
        _ndarrayOps2.default.assign(y.tensor, this.weights.b.tensor);
      }
      (0, _ndarrayBlasLevel.gemv)(1.0, this.weights.W.tensor.transpose(1, 0), x.tensor, 1.0, y.tensor);
      this.activationFunc(y);

      var transform = new _Tensor2.default([], [this.weights.W_carry.tensor.shape[1]]);
      if (this.bias) {
        _ndarrayOps2.default.assign(transform.tensor, this.weights.b_carry.tensor);
      }
      (0, _ndarrayBlasLevel.gemv)(1.0, this.weights.W_carry.tensor.transpose(1, 0), x.tensor, 1.0, transform.tensor);
      activations.sigmoid(transform);

      this._computeOutput(x.tensor, y.tensor, transform.tensor);

      return x;
    }
  }]);

  return Highway;
}(_Layer3.default);

exports.default = Highway;