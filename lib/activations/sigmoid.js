'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sigmoid;

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _cwise = require('cwise');

var _cwise2 = _interopRequireDefault(_cwise);

var _Tensor = require('../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _sigmoid = (0, _cwise2.default)({
  args: ['array'],
  body: function body(_x) {
    _x = 1 / (1 + Math.exp(-_x));
  }
});

/**
 * Sigmoid activation function. In-place operation.
 * @param {Tensor} x
 * @returns {Tensor} `this`
 */
function sigmoid(x) {
  _sigmoid(x.tensor);
  return this;
}