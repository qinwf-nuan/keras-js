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
 * Flatten layer class
 * Turns tensor into 1-d. Note there is no concept of batch size in these layers (single-batch).
 */
var Flatten = function (_Layer) {
  _inherits(Flatten, _Layer);

  /**
   * Creates a Flatten layer
   */
  function Flatten() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Flatten);

    var _this = _possibleConstructorReturn(this, (Flatten.__proto__ || Object.getPrototypeOf(Flatten)).call(this, attrs));

    _this.layerClass = 'Flatten';
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(Flatten, [{
    key: 'call',
    value: function call(x) {
      if (x.tensor.shape.length > 1) {
        var raveled = new _Tensor2.default([], [x.tensor.shape.reduce(function (a, b) {
          return a * b;
        }, 1)]);
        raveled.replaceTensorData(x.tensor.data);
        x.tensor = raveled.tensor;
      }
      return x;
    }
  }]);

  return Flatten;
}(_Layer3.default);

exports.default = Flatten;