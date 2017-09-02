'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = elu;

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _cwise = require('cwise');

var _cwise2 = _interopRequireDefault(_cwise);

var _Tensor = require('../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _elu = (0, _cwise2.default)({
  args: ['array', 'scalar'],
  body: function body(_x, alpha) {
    _x = Math.max(_x, 0) + alpha * (Math.exp(Math.min(_x, 0)) - 1);
  }
});

/**
 * ELU activation function. In-place operation.
 * @param {Tensor} x
 * @param {Number} opts.alpha
 * @returns {Tensor} `this`
 */
function elu(x) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _opts$alpha = opts.alpha,
      alpha = _opts$alpha === undefined ? 1.0 : _opts$alpha;

  _elu(x.tensor, alpha);
  return this;
}