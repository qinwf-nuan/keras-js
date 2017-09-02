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
 * LSTM layer class
 */
var LSTM = function (_Layer) {
  _inherits(LSTM, _Layer);

  /**
   * Creates a LSTM layer
   * @param {number} attrs.units - output dimensionality
   * @param {number} [attrs.activation] - activation function
   * @param {number} [attrs.recurrent_activation] - inner activation function
   * @param {number} [attrs.use_bias] - use bias
   * @param {number} [attrs.return_sequences] - return the last output in the output sequence or the full sequence
   * @param {number} [attrs.go_backwards] - process the input sequence backwards
   * @param {number} [attrs.stateful] - whether to save the last state as the initial state for the next pass
   * @param {Object} [attrs] - layer attributes
   */
  function LSTM() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, LSTM);

    var _this = _possibleConstructorReturn(this, (LSTM.__proto__ || Object.getPrototypeOf(LSTM)).call(this, attrs));

    _this._combine = (0, _cwise2.default)({
      args: ['array', 'array', 'array', 'array'],
      body: function body(_y, _x1, _x2, _b) {
        _y = _x1 + _x2 + _b;
      }
    });
    _this._update = (0, _cwise2.default)({
      args: ['array', 'array', 'array', 'array'],
      body: function body(_c, _ctm1, _i, _f) {
        _c = _c * _i + _ctm1 * _f;
      }
    });

    _this.layerClass = 'LSTM';

    var _attrs$units = attrs.units,
        units = _attrs$units === undefined ? 1 : _attrs$units,
        _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'tanh' : _attrs$activation,
        _attrs$use_bias = attrs.use_bias,
        use_bias = _attrs$use_bias === undefined ? true : _attrs$use_bias,
        _attrs$recurrent_acti = attrs.recurrent_activation,
        recurrent_activation = _attrs$recurrent_acti === undefined ? 'hard_sigmoid' : _attrs$recurrent_acti,
        _attrs$return_sequenc = attrs.return_sequences,
        return_sequences = _attrs$return_sequenc === undefined ? false : _attrs$return_sequenc,
        _attrs$go_backwards = attrs.go_backwards,
        go_backwards = _attrs$go_backwards === undefined ? false : _attrs$go_backwards,
        _attrs$stateful = attrs.stateful,
        stateful = _attrs$stateful === undefined ? false : _attrs$stateful;


    _this.units = units;

    // keep this.activation and this.recurrentActivation for Bidirectional wrapper layer to use
    _this.activation = activation;
    _this.recurrentActivation = recurrent_activation;
    _this.activationFunc = activations[activation];
    _this.recurrentActivationFunc = activations[recurrent_activation];

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
   * W weight tensor is split into W_i, W_f, W_c, W_o
   * U weight tensor is split into U_i, U_f, U_c, U_o
   * b weight tensor is split into b_i, b_f, b_c, b_o (or create empty bias if this.use_bias is false)
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(LSTM, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      _get(LSTM.prototype.__proto__ || Object.getPrototypeOf(LSTM.prototype), 'setWeights', this).call(this, weightsArr);

      var shape_W = this.weights['kernel'].tensor.shape;
      this.weights['W_i'] = new _Tensor2.default([], [shape_W[0], this.units]);
      this.weights['W_f'] = new _Tensor2.default([], [shape_W[0], this.units]);
      this.weights['W_c'] = new _Tensor2.default([], [shape_W[0], this.units]);
      this.weights['W_o'] = new _Tensor2.default([], [shape_W[0], this.units]);
      _ndarrayOps2.default.assign(this.weights['W_i'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], this.units).lo(0, 0));
      _ndarrayOps2.default.assign(this.weights['W_f'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], 2 * this.units).lo(0, this.units));
      _ndarrayOps2.default.assign(this.weights['W_c'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], 3 * this.units).lo(0, 2 * this.units));
      _ndarrayOps2.default.assign(this.weights['W_o'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], 4 * this.units).lo(0, 3 * this.units));

      var shape_U = this.weights['recurrent_kernel'].tensor.shape;
      this.weights['U_i'] = new _Tensor2.default([], [shape_U[0], this.units]);
      this.weights['U_f'] = new _Tensor2.default([], [shape_U[0], this.units]);
      this.weights['U_c'] = new _Tensor2.default([], [shape_U[0], this.units]);
      this.weights['U_o'] = new _Tensor2.default([], [shape_U[0], this.units]);
      _ndarrayOps2.default.assign(this.weights['U_i'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], this.units).lo(0, 0));
      _ndarrayOps2.default.assign(this.weights['U_f'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 2 * this.units).lo(0, this.units));
      _ndarrayOps2.default.assign(this.weights['U_c'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 3 * this.units).lo(0, 2 * this.units));
      _ndarrayOps2.default.assign(this.weights['U_o'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 4 * this.units).lo(0, 3 * this.units));

      this.weights['b_i'] = new _Tensor2.default([], [this.units]);
      this.weights['b_f'] = new _Tensor2.default([], [this.units]);
      this.weights['b_c'] = new _Tensor2.default([], [this.units]);
      this.weights['b_o'] = new _Tensor2.default([], [this.units]);
      if (this.use_bias) {
        _ndarrayOps2.default.assign(this.weights['b_i'].tensor, this.weights['bias'].tensor.hi(this.units).lo(0));
        _ndarrayOps2.default.assign(this.weights['b_f'].tensor, this.weights['bias'].tensor.hi(2 * this.units).lo(this.units));
        _ndarrayOps2.default.assign(this.weights['b_c'].tensor, this.weights['bias'].tensor.hi(3 * this.units).lo(2 * this.units));
        _ndarrayOps2.default.assign(this.weights['b_o'].tensor, this.weights['bias'].tensor.hi(4 * this.units).lo(3 * this.units));
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

      var dimInputGate = this.weights['b_i'].tensor.shape[0];
      var dimCandidate = this.weights['b_c'].tensor.shape[0];
      var dimForgetGate = this.weights['b_f'].tensor.shape[0];
      var dimOutputGate = this.weights['b_o'].tensor.shape[0];

      var currentInputGateState = new _Tensor2.default([], [dimInputGate]);
      var tempXI = new _Tensor2.default([], [dimInputGate]);
      var tempHI = new _Tensor2.default([], [dimInputGate]);

      var currentForgetGateState = new _Tensor2.default([], [dimForgetGate]);
      var tempXF = new _Tensor2.default([], [dimForgetGate]);
      var tempHF = new _Tensor2.default([], [dimForgetGate]);

      var currentOutputGateState = new _Tensor2.default([], [dimOutputGate]);
      var tempXO = new _Tensor2.default([], [dimOutputGate]);
      var tempHO = new _Tensor2.default([], [dimOutputGate]);

      var currentCandidate = new _Tensor2.default([], [dimCandidate]);
      var tempXC = new _Tensor2.default([], [dimCandidate]);
      var tempHC = new _Tensor2.default([], [dimCandidate]);
      var previousCandidate = this.stateful && this.previousCandidate ? this.previousCandidate : new _Tensor2.default([], [dimCandidate]);

      var currentHiddenState = this.stateful && this.currentHiddenState ? this.currentHiddenState : new _Tensor2.default([], [dimCandidate]);
      var previousHiddenState = new _Tensor2.default([], [dimCandidate]);

      this.hiddenStateSequence = new _Tensor2.default([], [x.tensor.shape[0], dimCandidate]);

      var _clearTemp = function _clearTemp() {
        var tempTensors = [tempXI, tempHI, tempXF, tempHF, tempXO, tempHO, tempXC, tempHC];
        tempTensors.forEach(function (temp) {
          return _ndarrayOps2.default.assigns(temp.tensor, 0);
        });
      };

      var _step = function _step() {
        _ndarrayOps2.default.assign(previousHiddenState.tensor, currentHiddenState.tensor);

        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['W_i'].tensor.transpose(1, 0), currentX.tensor, 1, tempXI.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['U_i'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHI.tensor);
        _this2._combine(currentInputGateState.tensor, tempXI.tensor, tempHI.tensor, _this2.weights['b_i'].tensor);
        _this2.recurrentActivationFunc(currentInputGateState);

        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['W_f'].tensor.transpose(1, 0), currentX.tensor, 1, tempXF.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['U_f'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHF.tensor);
        _this2._combine(currentForgetGateState.tensor, tempXF.tensor, tempHF.tensor, _this2.weights['b_f'].tensor);
        _this2.recurrentActivationFunc(currentForgetGateState);

        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['W_o'].tensor.transpose(1, 0), currentX.tensor, 1, tempXO.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['U_o'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHO.tensor);
        _this2._combine(currentOutputGateState.tensor, tempXO.tensor, tempHO.tensor, _this2.weights['b_o'].tensor);
        _this2.recurrentActivationFunc(currentOutputGateState);

        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['W_c'].tensor.transpose(1, 0), currentX.tensor, 1, tempXC.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['U_c'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHC.tensor);
        _this2._combine(currentCandidate.tensor, tempXC.tensor, tempHC.tensor, _this2.weights['b_c'].tensor);
        _this2.activationFunc(currentCandidate);

        _this2._update(currentCandidate.tensor, previousCandidate.tensor, currentInputGateState.tensor, currentForgetGateState.tensor);

        _ndarrayOps2.default.assign(previousCandidate.tensor, currentCandidate.tensor);

        _this2.activationFunc(currentCandidate);
        _ndarrayOps2.default.mul(currentHiddenState.tensor, currentOutputGateState.tensor, currentCandidate.tensor);
      };

      for (var i = 0, len = x.tensor.shape[0]; i < len; i++) {
        var inputIndex = this.goBackwards ? len - i - 1 : i;
        _ndarrayOps2.default.assign(currentX.tensor, x.tensor.pick(inputIndex, null));
        _clearTemp();
        _step();

        _ndarrayOps2.default.assign(this.hiddenStateSequence.tensor.pick(i, null), currentHiddenState.tensor);
      }

      if (this.returnSequences) {
        x.tensor = this.hiddenStateSequence.tensor;
      } else {
        x.tensor = currentHiddenState.tensor;
      }

      if (this.stateful) {
        this.previousCandidate = previousCandidate;
        this.currentHiddenState = currentHiddenState;
      }

      return x;
    }
  }]);

  return LSTM;
}(_Layer3.default);

exports.default = LSTM;