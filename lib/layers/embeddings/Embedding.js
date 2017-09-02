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
 * Embedding layer class
 */
var Embedding = function (_Layer) {
  _inherits(Embedding, _Layer);

  /**
   * Creates a Embedding layer
   */
  function Embedding() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Embedding);

    var _this = _possibleConstructorReturn(this, (Embedding.__proto__ || Object.getPrototypeOf(Embedding)).call(this, attrs));

    _this.layerClass = 'Embedding';

    var _attrs$input_dim = attrs.input_dim,
        input_dim = _attrs$input_dim === undefined ? 1 : _attrs$input_dim,
        _attrs$output_dim = attrs.output_dim,
        output_dim = _attrs$output_dim === undefined ? 1 : _attrs$output_dim,
        _attrs$input_length = attrs.input_length,
        input_length = _attrs$input_length === undefined ? 0 : _attrs$input_length,
        _attrs$mask_zero = attrs.mask_zero,
        mask_zero = _attrs$mask_zero === undefined ? false : _attrs$mask_zero;


    _this.inputDim = input_dim;
    _this.outputDim = output_dim;
    _this.inputLength = input_length;

    // mask_zero will be important for subsequent layers
    _this.maskZero = mask_zero;

    // Layer weights specification
    _this.params = ['embeddings'];
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(Embedding, [{
    key: 'call',
    value: function call(x) {
      var y = new _Tensor2.default([], [x.tensor.shape[0], this.weights['embeddings'].tensor.shape[1]]);

      for (var i = 0, len = x.tensor.shape[0]; i < len; i++) {
        _ndarrayOps2.default.assign(y.tensor.pick(i, null), this.weights['embeddings'].tensor.pick(x.tensor.get(i), null));
      }

      x.tensor = y.tensor;
      return x;
    }
  }]);

  return Embedding;
}(_Layer3.default);

exports.default = Embedding;