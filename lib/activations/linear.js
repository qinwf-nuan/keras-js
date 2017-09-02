'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = linear;

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _cwise = require('cwise');

var _cwise2 = _interopRequireDefault(_cwise);

var _Tensor = require('../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Linear activation function. In-place operation.
 * @param {Tensor} x
 * @returns {Tensor} `this`
 */
function linear(x) {
  return this;
}