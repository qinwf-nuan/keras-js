'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Permute layer class
 * Note there is no concept of batch size in these layers (single-batch), so dim numbers 1 less
 * i.e., dim 1 in keras corresponds to dim 0 here, etc.
 */
var Permute = function (_Layer) {
  _inherits(Permute, _Layer);

  /**
   * Creates a Permute layer
   * @param {number[]} attrs.dims
   */
  function Permute() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Permute);

    var _this = _possibleConstructorReturn(this, (Permute.__proto__ || Object.getPrototypeOf(Permute)).call(this, attrs));

    _this.layerClass = 'Permute';

    var _attrs$dims = attrs.dims,
        dims = _attrs$dims === undefined ? [] : _attrs$dims;

    _this.dims = dims.map(function (dim) {
      return dim - 1;
    });
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(Permute, [{
    key: 'call',
    value: function call(x) {
      var _x$tensor;

      if (this.dims.length !== x.tensor.shape.length) {
        throw new Error(`${this.name} [Permute layer] The specified dims permutation must match the number of dimensions.`);
      }
      x.tensor = (_x$tensor = x.tensor).transpose.apply(_x$tensor, _toConsumableArray(this.dims));
      return x;
    }
  }]);

  return Permute;
}(_Layer3.default);

exports.default = Permute;