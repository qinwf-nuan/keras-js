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
 * SpatialDropout3D layer class
 * Note that this layer is here only for compatibility purposes,
 * as it's only active during training phase.
 */
var SpatialDropout3D = function (_Layer) {
  _inherits(SpatialDropout3D, _Layer);

  /**
   * Creates an SpatialDropout3D layer
   * @param {number} attrs.p - fraction of the input units to drop (between 0 and 1)
   * @param {number} [attrs.dimOrdering] - `tf` or `th`
   */
  function SpatialDropout3D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SpatialDropout3D);

    var _this = _possibleConstructorReturn(this, (SpatialDropout3D.__proto__ || Object.getPrototypeOf(SpatialDropout3D)).call(this, attrs));

    _this.layerClass = 'SpatialDropout3D';

    var _attrs$p = attrs.p,
        p = _attrs$p === undefined ? 0.5 : _attrs$p,
        _attrs$dimOrdering = attrs.dimOrdering,
        dimOrdering = _attrs$dimOrdering === undefined ? 'tf' : _attrs$dimOrdering;


    _this.p = Math.min(Math.max(0, p), 1);
    _this.dimOrdering = dimOrdering;
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(SpatialDropout3D, [{
    key: 'call',
    value: function call(x) {
      return x;
    }
  }]);

  return SpatialDropout3D;
}(_Layer3.default);

exports.default = SpatialDropout3D;