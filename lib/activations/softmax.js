'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = softmax;

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _cwise = require('cwise');

var _cwise2 = _interopRequireDefault(_cwise);

var _Tensor = require('../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Softmax activation function. In-place operation.
 * @param {Tensor} x
 * @returns {Tensor} `this`
 */
function softmax(x) {
  if (x.tensor.shape.length === 1) {
    var maxval = _ndarrayOps2.default.sup(x.tensor);
    _ndarrayOps2.default.subseq(x.tensor, maxval);
    _ndarrayOps2.default.expeq(x.tensor);
    var sum = _ndarrayOps2.default.sum(x.tensor);
    _ndarrayOps2.default.divseq(x.tensor, sum);
  } else if (x.tensor.shape.length === 2) {
    for (var i = 0; i < x.tensor.shape[0]; i++) {
      var _maxval = _ndarrayOps2.default.sup(x.tensor.pick(i, null));
      _ndarrayOps2.default.subseq(x.tensor.pick(i, null), _maxval);
      _ndarrayOps2.default.expeq(x.tensor.pick(i, null));
      var _sum = _ndarrayOps2.default.sum(x.tensor.pick(i, null));
      _ndarrayOps2.default.divseq(x.tensor.pick(i, null), _sum);
    }
  } else {
    throw new Error(`[activations.softmax] tensor shape ${x.tensor.shape} not supported.`);
  }
  return this;
}