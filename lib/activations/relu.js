'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = relu;

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _cwise = require('cwise');

var _cwise2 = _interopRequireDefault(_cwise);

var _Tensor = require('../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ReLU activation function. In-place operation.
 * @param {Tensor} x
 * @param {Number} opts.alpha
 * @param {Number} opts.maxValue
 * @returns {Tensor} `this`
 */
function relu(x) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _opts$alpha = opts.alpha,
      alpha = _opts$alpha === undefined ? 0 : _opts$alpha,
      _opts$maxValue = opts.maxValue,
      maxValue = _opts$maxValue === undefined ? null : _opts$maxValue;

  var neg = void 0;
  if (alpha !== 0) {
    neg = new _Tensor2.default([], x.tensor.shape);
    _ndarrayOps2.default.mins(neg.tensor, x.tensor, 0);
    _ndarrayOps2.default.mulseq(neg.tensor, alpha);
  }
  _ndarrayOps2.default.maxseq(x.tensor, 0);
  if (maxValue) {
    _ndarrayOps2.default.minseq(x.tensor, maxValue);
  }
  if (neg) {
    _ndarrayOps2.default.addeq(x.tensor, neg.tensor);
  }
  return this;
}