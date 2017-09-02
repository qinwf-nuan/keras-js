'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * GaussianNoise layer class
 * Note that this layer is here only for compatibility purposes,
 * as it's only active during training phase.
 */
var GaussianNoise = function (_Layer) {
  _inherits(GaussianNoise, _Layer);

  /**
   * Creates a GaussianNoise layer
   * @param {number} attrs.p - fraction of the input units to drop (between 0 and 1)
   */
  function GaussianNoise() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, GaussianNoise);

    var _this = _possibleConstructorReturn(this, (GaussianNoise.__proto__ || Object.getPrototypeOf(GaussianNoise)).call(this, attrs));

    _this.layerClass = 'GaussianNoise';

    var _attrs$sigma = attrs.sigma,
        sigma = _attrs$sigma === undefined ? 0 : _attrs$sigma;
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(GaussianNoise, [{
    key: 'call',
    value: function call(x) {
      return x;
    }
  }]);

  return GaussianNoise;
}(_Layer3.default);

exports.default = GaussianNoise;