'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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
 * SimpleRNN layer class
 */
var SimpleRNN = function (_Layer) {
  _inherits(SimpleRNN, _Layer);

  /**
   * Creates a SimpleRNN layer
   * @param {number} attrs.units - output dimensionality
   * @param {number} [attrs.activation] - activation function
   * @param {number} [attrs.use_bias] - use bias
   * @param {number} [attrs.return_sequences] - return the last output in the output sequence or the full sequence
   * @param {number} [attrs.go_backwards] - process the input sequence backwards
   * @param {number} [attrs.stateful] - whether to save the last state as the initial state for the next pass
   * @param {Object} [attrs] - layer attributes
   */
  function SimpleRNN() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SimpleRNN);

    var _this = _possibleConstructorReturn(this, (SimpleRNN.__proto__ || Object.getPrototypeOf(SimpleRNN)).call(this, attrs));

    _this._combine = (0, _cwise2.default)({
      args: ['array', 'array', 'array', 'array'],
      body: function body(_y, _x1, _x2, _b) {
        _y = _x1 + _x2 + _b;
      }
    });

    _this.layerClass = 'SimpleRNN';

    var _attrs$units = attrs.units,
        units = _attrs$units === undefined ? 1 : _attrs$units,
        _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'tanh' : _attrs$activation,
        _attrs$use_bias = attrs.use_bias,
        use_bias = _attrs$use_bias === undefined ? true : _attrs$use_bias,
        _attrs$return_sequenc = attrs.return_sequences,
        return_sequences = _attrs$return_sequenc === undefined ? false : _attrs$return_sequenc,
        _attrs$go_backwards = attrs.go_backwards,
        go_backwards = _attrs$go_backwards === undefined ? false : _attrs$go_backwards,
        _attrs$stateful = attrs.stateful,
        stateful = _attrs$stateful === undefined ? false : _attrs$stateful;


    _this.units = units;

    // keep this.activation for Bidirectional wrapper layer to use
    _this.activation = activation;
    _this.activationFunc = activations[activation];

    _this.use_bias = use_bias;

    _this.returnSequences = return_sequences;
    _this.goBackwards = go_backwards;
    _this.stateful = stateful;

    // Layer weights specification
    _this.params = _this.use_bias ? ['kernel', 'recurrent_kernel', 'bias'] : ['kernel', 'recurrent_kernel'];
    return _this;
  }

  /**
   * Method for setting layer weights. Extends `super` method.
   * Create empty bias if this.use_bias is false.
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(SimpleRNN, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      _get(SimpleRNN.prototype.__proto__ || Object.getPrototypeOf(SimpleRNN.prototype), 'setWeights', this).call(this, weightsArr);
      if (!this.use_bias) {
        this.weights['bias'] = new _Tensor2.default([], [this.units]);
      }
    }
  }, {
    key: 'call',


    /**
     * Method for layer computational logic
     * @param {Tensor} x
     * @returns {Tensor} x
     */
    value: function call(x) {
      var _this2 = this;

      var currentX = new _Tensor2.default([], [x.tensor.shape[1]]);

      var dimHiddenState = this.units;
      var currentHiddenState = this.stateful && this.currentHiddenState ? this.currentHiddenState : new _Tensor2.default([], [dimHiddenState]);
      var tempXH = new _Tensor2.default([], [dimHiddenState]);
      var tempHH = new _Tensor2.default([], [dimHiddenState]);
      var previousHiddenState = new _Tensor2.default([], [dimHiddenState]);

      this.hiddenStateSequence = new _Tensor2.default([], [x.tensor.shape[0], dimHiddenState]);

      var _clearTemp = function _clearTemp() {
        var tempTensors = [tempXH, tempHH];
        tempTensors.forEach(function (temp) {
          return _ndarrayOps2.default.assigns(temp.tensor, 0);
        });
      };

      var _step = function _step() {
        _ndarrayOps2.default.assign(previousHiddenState.tensor, currentHiddenState.tensor);

        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['kernel'].tensor.transpose(1, 0), currentX.tensor, 1, tempXH.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['recurrent_kernel'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHH.tensor);
        _this2._combine(currentHiddenState.tensor, tempXH.tensor, tempHH.tensor, _this2.weights['bias'].tensor);
        _this2.activationFunc(currentHiddenState);
      };

      for (var i = 0, len = x.tensor.shape[0]; i < len; i++) {
        var inputIndex = this.goBackwards ? len - i - 1 : i;
        _ndarrayOps2.default.assign(currentX.tensor, x.tensor.pick(inputIndex, null));
        _clearTemp();
        _step();

        if (this.returnSequences) {
          _ndarrayOps2.default.assign(this.hiddenStateSequence.tensor.pick(i, null), currentHiddenState.tensor);
        }
      }

      if (this.returnSequences) {
        x.tensor = this.hiddenStateSequence.tensor;
      } else {
        x.tensor = currentHiddenState.tensor;
      }

      if (this.stateful) {
        this.currentHiddenState = currentHiddenState;
      }

      return x;
    }
  }]);

  return SimpleRNN;
}(_Layer3.default);

exports.default = SimpleRNN;