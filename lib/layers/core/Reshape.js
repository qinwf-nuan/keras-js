'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Reshape layer class
 * Note there is no concept of batch size in these layers (single-batch).
 */
var Reshape = function (_Layer) {
  _inherits(Reshape, _Layer);

  /**
   * Creates a Reshape layer
   * @param {number[]} attrs.target_shape
   */
  function Reshape() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Reshape);

    var _this = _possibleConstructorReturn(this, (Reshape.__proto__ || Object.getPrototypeOf(Reshape)).call(this, attrs));

    _this.layerClass = 'Reshape';

    var _attrs$target_shape = attrs.target_shape,
        target_shape = _attrs$target_shape === undefined ? [] : _attrs$target_shape;

    _this.targetShape = target_shape;
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(Reshape, [{
    key: 'call',
    value: function call(x) {
      if (this.targetShape.reduce(function (a, b) {
        return a * b;
      }, 1) !== x.tensor.size) {
        throw new Error(`${this.name} [Reshape layer] The total size of new array must be unchanged in reshape layer.`);
      }
      var reshaped = new _Tensor2.default([], this.targetShape);
      reshaped.replaceTensorData(x.tensor.data);
      x.tensor = reshaped.tensor;
      return x;
    }
  }]);

  return Reshape;
}(_Layer3.default);

exports.default = Reshape;