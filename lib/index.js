'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testUtils = exports.layers = exports.activations = exports.Tensor = exports.Model = undefined;

require('babel-polyfill');

var _Model = require('./Model');

var _Model2 = _interopRequireDefault(_Model);

var _Tensor = require('./Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _activations = require('./activations');

var activations = _interopRequireWildcard(_activations);

var _layers = require('./layers');

var layers = _interopRequireWildcard(_layers);

var _testUtils = require('./utils/testUtils');

var testUtils = _interopRequireWildcard(_testUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (typeof window !== 'undefined') {
  var weblas = require('weblas/dist/weblas');
  window.weblas = weblas;
}

/*
if (typeof window !== 'undefined' && 'WebAssembly' in window) {
  window.nnpack = {
    wasmBinary: require('arraybuffer-loader!./nnpack/libnnpack.wasm')
  }
  // libnnpack.js replaces first line so that we can use as global:
  // `var Modules;`
  // with
  // `var Modules = window.nnpack;`
  require('script-loader!./nnpack/libnnpack.js')
}
*/

exports.Model = _Model2.default;
exports.Tensor = _Tensor2.default;
exports.activations = activations;
exports.layers = layers;
exports.testUtils = testUtils;