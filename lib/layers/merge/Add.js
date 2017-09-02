'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Merge3 = require('./_Merge');

var _Merge4 = _interopRequireDefault(_Merge3);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _WebGL = require('../../WebGL2');

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Add merge layer class, extends abstract _Merge class
 */
var Add = function (_Merge2) {
  _inherits(Add, _Merge2);

  /**
   * Creates a Add merge layer
   */
  function Add() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Add);

    var _this = _possibleConstructorReturn(this, (Add.__proto__ || Object.getPrototypeOf(Add)).call(this, attrs));

    _this.layerClass = 'Add';

    _this.mode = 'sum';

    // GPU setup
    if (_this.gpu) {
      _this.mergeProgram = _WebGL.webgl2.compileProgram(require('./Add.webgl2.glsl'));
    }
    return _this;
  }

  /**
   * CPU call
   * @param {Tensor[]} inputs
   */


  _createClass(Add, [{
    key: '_call_cpu',
    value: function _call_cpu(inputs) {
      var outputShape = inputs[0].tensor.shape.slice();
      this.output = new _Tensor2.default([], outputShape);

      for (var i = 0; i < inputs.length; i++) {
        _ndarrayOps2.default.addeq(this.output.tensor, inputs[i].tensor);
      }
    }
  }]);

  return Add;
}(_Merge4.default);

exports.default = Add;