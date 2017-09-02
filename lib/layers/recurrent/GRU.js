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
 * GRU layer class
 */
var GRU = function (_Layer) {
  _inherits(GRU, _Layer);

  /**
   * Creates a GRU layer
   * @param {number} attrs.units - output dimensionality
   * @param {number} [attrs.activation] - activation function
   * @param {number} [attrs.recurrent_activation] - inner activation function
   * @param {number} [attrs.use_bias] - use bias
   * @param {number} [attrs.return_sequences] - return the last output in the output sequence or the full sequence
   * @param {number} [attrs.go_backwards] - process the input sequence backwards
   * @param {number} [attrs.stateful] - whether to save the last state as the initial state for the next pass
   * @param {Object} [attrs] - layer attributes
   */
  function GRU() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, GRU);

    var _this = _possibleConstructorReturn(this, (GRU.__proto__ || Object.getPrototypeOf(GRU)).call(this, attrs));

    _this._combine = (0, _cwise2.default)({
      args: ['array', 'array', 'array', 'array'],
      body: function body(_y, _x1, _x2, _b) {
        _y = _x1 + _x2 + _b;
      }
    });
    _this._update = (0, _cwise2.default)({
      args: ['array', 'array', 'array'],
      body: function body(_h, _htm1, _z) {
        _h = _h * (1 - _z) + _htm1 * _z;
      }
    });

    _this.layerClass = 'GRU';

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
   * W weight tensor is split into W_z, W_r, W_h
   * U weight tensor is split into U_z, U_r, U_h
   * b weight tensor is split into b_z, b_r, b_h (or create empty bias if this.use_bias is false)
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(GRU, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      _get(GRU.prototype.__proto__ || Object.getPrototypeOf(GRU.prototype), 'setWeights', this).call(this, weightsArr);

      var shape_W = this.weights['kernel'].tensor.shape;
      this.weights['W_z'] = new _Tensor2.default([], [shape_W[0], this.units]);
      this.weights['W_r'] = new _Tensor2.default([], [shape_W[0], this.units]);
      this.weights['W_h'] = new _Tensor2.default([], [shape_W[0], this.units]);
      _ndarrayOps2.default.assign(this.weights['W_z'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], this.units).lo(0, 0));
      _ndarrayOps2.default.assign(this.weights['W_r'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], 2 * this.units).lo(0, this.units));
      _ndarrayOps2.default.assign(this.weights['W_h'].tensor, this.weights['kernel'].tensor.hi(shape_W[0], 3 * this.units).lo(0, 2 * this.units));

      var shape_U = this.weights['recurrent_kernel'].tensor.shape;
      this.weights['U_z'] = new _Tensor2.default([], [shape_U[0], this.units]);
      this.weights['U_r'] = new _Tensor2.default([], [shape_U[0], this.units]);
      this.weights['U_h'] = new _Tensor2.default([], [shape_U[0], this.units]);
      _ndarrayOps2.default.assign(this.weights['U_z'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], this.units).lo(0, 0));
      _ndarrayOps2.default.assign(this.weights['U_r'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 2 * this.units).lo(0, this.units));
      _ndarrayOps2.default.assign(this.weights['U_h'].tensor, this.weights['recurrent_kernel'].tensor.hi(shape_U[0], 3 * this.units).lo(0, 2 * this.units));

      this.weights['b_z'] = new _Tensor2.default([], [this.units]);
      this.weights['b_r'] = new _Tensor2.default([], [this.units]);
      this.weights['b_h'] = new _Tensor2.default([], [this.units]);
      if (this.use_bias) {
        _ndarrayOps2.default.assign(this.weights['b_z'].tensor, this.weights['bias'].tensor.hi(this.units).lo(0));
        _ndarrayOps2.default.assign(this.weights['b_r'].tensor, this.weights['bias'].tensor.hi(2 * this.units).lo(this.units));
        _ndarrayOps2.default.assign(this.weights['b_h'].tensor, this.weights['bias'].tensor.hi(3 * this.units).lo(2 * this.units));
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

      var dimUpdateGate = this.units;
      var dimResetGate = this.units;
      var dimHiddenState = this.units;

      var currentUpdateGateState = new _Tensor2.default([], [dimUpdateGate]);
      var tempXZ = new _Tensor2.default([], [dimUpdateGate]);
      var tempHZ = new _Tensor2.default([], [dimUpdateGate]);

      var currentResetGateState = new _Tensor2.default([], [dimResetGate]);
      var tempXR = new _Tensor2.default([], [dimResetGate]);
      var tempHR = new _Tensor2.default([], [dimResetGate]);

      var currentHiddenState = this.stateful && this.currentHiddenState ? this.currentHiddenState : new _Tensor2.default([], [dimHiddenState]);
      var tempXH = new _Tensor2.default([], [dimHiddenState]);
      var tempHH = new _Tensor2.default([], [dimHiddenState]);
      var previousHiddenState = new _Tensor2.default([], [dimHiddenState]);

      this.hiddenStateSequence = new _Tensor2.default([], [x.tensor.shape[0], dimHiddenState]);

      var _clearTemp = function _clearTemp() {
        var tempTensors = [tempXZ, tempHZ, tempXR, tempHR, tempXH, tempHH];
        tempTensors.forEach(function (temp) {
          return _ndarrayOps2.default.assigns(temp.tensor, 0);
        });
      };

      var _step = function _step() {
        _ndarrayOps2.default.assign(previousHiddenState.tensor, currentHiddenState.tensor);

        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['W_z'].tensor.transpose(1, 0), currentX.tensor, 1, tempXZ.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['U_z'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHZ.tensor);
        _this2._combine(currentUpdateGateState.tensor, tempXZ.tensor, tempHZ.tensor, _this2.weights['b_z'].tensor);
        _this2.recurrentActivationFunc(currentUpdateGateState);

        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['W_r'].tensor.transpose(1, 0), currentX.tensor, 1, tempXR.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['U_r'].tensor.transpose(1, 0), previousHiddenState.tensor, 1, tempHR.tensor);
        _this2._combine(currentResetGateState.tensor, tempXR.tensor, tempHR.tensor, _this2.weights['b_r'].tensor);
        _this2.recurrentActivationFunc(currentResetGateState);

        _ndarrayOps2.default.muleq(currentResetGateState.tensor, previousHiddenState.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['W_h'].tensor.transpose(1, 0), currentX.tensor, 1, tempXH.tensor);
        (0, _ndarrayBlasLevel.gemv)(1, _this2.weights['U_h'].tensor.transpose(1, 0), currentResetGateState.tensor, 1, tempHH.tensor);
        _this2._combine(currentHiddenState.tensor, tempXH.tensor, tempHH.tensor, _this2.weights['b_h'].tensor);
        _this2.activationFunc(currentHiddenState);

        _this2._update(currentHiddenState.tensor, previousHiddenState.tensor, currentUpdateGateState.tensor);
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

  return GRU;
}(_Layer3.default);

exports.default = GRU;