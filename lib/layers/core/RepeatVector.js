'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _ndarrayUnsqueeze = require('ndarray-unsqueeze');

var _ndarrayUnsqueeze2 = _interopRequireDefault(_ndarrayUnsqueeze);

var _ndarrayTile = require('ndarray-tile');

var _ndarrayTile2 = _interopRequireDefault(_ndarrayTile);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * RepeatVector layer class
 * Turns 2D tensors of shape [features] to 3D tensors of shape [n, features].
 * Note there is no concept of batch size in these layers (single-batch) so we're actually going from 1D to 2D.
 */
var RepeatVector = function (_Layer) {
  _inherits(RepeatVector, _Layer);

  /**
   * Creates a RepeatVector layer
   * @param {number} attrs.n
   */
  function RepeatVector() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RepeatVector);

    var _this = _possibleConstructorReturn(this, (RepeatVector.__proto__ || Object.getPrototypeOf(RepeatVector)).call(this, attrs));

    _this.layerClass = 'RepeatVector';

    var _attrs$n = attrs.n,
        n = _attrs$n === undefined ? 1 : _attrs$n;

    _this.n = n;
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(RepeatVector, [{
    key: 'call',
    value: function call(x) {
      if (x.tensor.shape.length !== 1) {
        throw new Error(`${this.name} [RepeatVector layer] Only 1D tensor inputs allowed.`);
      }
      x.tensor = (0, _ndarrayTile2.default)((0, _ndarrayUnsqueeze2.default)(x.tensor, 0), [this.n, 1]);
      return x;
    }
  }]);

  return RepeatVector;
}(_Layer3.default);

exports.default = RepeatVector;