'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GaussianNoise = exports.GaussianDropout = undefined;

var _GaussianDropout = require('./GaussianDropout');

var _GaussianDropout2 = _interopRequireDefault(_GaussianDropout);

var _GaussianNoise = require('./GaussianNoise');

var _GaussianNoise2 = _interopRequireDefault(_GaussianNoise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.GaussianDropout = _GaussianDropout2.default;
exports.GaussianNoise = _GaussianNoise2.default;