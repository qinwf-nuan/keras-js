'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * InputLayer layer class
 */
var InputLayer = function (_Layer) {
  _inherits(InputLayer, _Layer);

  /**
   * Creates an InputLayer layer
   */
  function InputLayer() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, InputLayer);

    var _this = _possibleConstructorReturn(this, (InputLayer.__proto__ || Object.getPrototypeOf(InputLayer)).call(this, attrs));

    _this.layerClass = 'InputLayer';

    var _attrs$shape = attrs.shape,
        shape = _attrs$shape === undefined ? [] : _attrs$shape;


    _this.shape = attrs.batch_input_shape && attrs.batch_input_shape.length ? attrs.batch_input_shape.slice(1) : shape;
    return _this;
  }

  _createClass(InputLayer, [{
    key: 'call',
    value: function call(x) {
      if (!(0, _isEqual2.default)(x.tensor.shape, this.shape)) {
        throw new Error(`[InputLayer] input tensor shape ${x.tensor.shape} does not match specified shape ${this.shape}.`);
      }
      return x;
    }
  }]);

  return InputLayer;
}(_Layer3.default);

exports.default = InputLayer;