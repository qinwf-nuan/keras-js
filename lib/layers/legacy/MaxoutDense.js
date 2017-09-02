'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _ndarrayBlasLevel = require('ndarray-blas-level2');

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * MaxoutDense layer class
 * From Keras docs: takes the element-wise maximum of nb_feature Dense(input_dim, output_dim) linear layers
 * Note that `nb_feature` is implicit in the weights tensors, with shapes:
 * - W: [nb_feature, input_dim, output_dim]
 * - b: [nb_feature, output_dim]
 */
var MaxoutDense = function (_Layer) {
  _inherits(MaxoutDense, _Layer);

  /**
   * Creates a MaxoutDense layer
   * @param {number} attrs.output_dim - output dimension size
   * @param {Object} [attrs] - layer attributes
   */
  function MaxoutDense() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, MaxoutDense);

    var _this = _possibleConstructorReturn(this, (MaxoutDense.__proto__ || Object.getPrototypeOf(MaxoutDense)).call(this, attrs));

    _this.layerClass = 'MaxoutDense';

    var _attrs$output_dim = attrs.output_dim,
        output_dim = _attrs$output_dim === undefined ? 1 : _attrs$output_dim,
        _attrs$input_dim = attrs.input_dim,
        input_dim = _attrs$input_dim === undefined ? null : _attrs$input_dim,
        _attrs$bias = attrs.bias,
        bias = _attrs$bias === undefined ? true : _attrs$bias;

    _this.outputDim = output_dim;
    _this.inputDim = input_dim;
    _this.bias = bias;

    // Layer weights specification
    _this.params = _this.bias ? ['W', 'b'] : ['W'];
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(MaxoutDense, [{
    key: 'call',
    value: function call(x) {
      var nbFeature = this.weights.W.tensor.shape[0];

      var featMax = new _Tensor2.default([], [this.outputDim]);
      for (var i = 0; i < nbFeature; i++) {
        var y = new _Tensor2.default([], [this.outputDim]);
        if (this.bias) {
          _ndarrayOps2.default.assign(y.tensor, this.weights.b.tensor.pick(i, null));
        }
        (0, _ndarrayBlasLevel.gemv)(1.0, this.weights.W.tensor.pick(i, null, null).transpose(1, 0), x.tensor, 1.0, y.tensor);
        _ndarrayOps2.default.maxeq(featMax.tensor, y.tensor);
      }

      x.tensor = featMax.tensor;
      return x;
    }
  }]);

  return MaxoutDense;
}(_Layer3.default);

exports.default = MaxoutDense;