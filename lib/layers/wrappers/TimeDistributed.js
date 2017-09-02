'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * TimeDistributed wrapper layer class
 */
var TimeDistributed = function (_Layer) {
  _inherits(TimeDistributed, _Layer);

  /**
   * Creates a TimeDistributed wrapper layer
   * @param {Layer} attrs.layer
   */
  function TimeDistributed() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, TimeDistributed);

    var _this = _possibleConstructorReturn(this, (TimeDistributed.__proto__ || Object.getPrototypeOf(TimeDistributed)).call(this, attrs));

    _this.layerClass = 'TimeDistributed';

    var layer = attrs.layer;


    if (!layer) throw new Error('[TimeDistributed] wrapped layer is undefined.');
    _this.layer = layer;
    return _this;
  }

  /**
   * Method for setting layer weights
   * Passes weights to the wrapped layer
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(TimeDistributed, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      this.layer.setWeights(weightsArr);
    }

    /**
     * Method for layer computational logic
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: 'call',
    value: function call(x) {
      var _x$tensor, _y$tensor;

      var xStepShape = [].concat(_toConsumableArray(x.tensor.shape.slice(1)));
      var xStep = new _Tensor2.default([], xStepShape);
      _ndarrayOps2.default.assign(xStep.tensor, (_x$tensor = x.tensor).pick.apply(_x$tensor, [0].concat(_toConsumableArray(xStepShape.map(function (s) {
        return null;
      })))));
      var yStep = this.layer.call(xStep);
      var yStepShape = yStep.tensor.shape.slice();
      var y = new _Tensor2.default([], [x.tensor.shape[0]].concat(_toConsumableArray(yStepShape)));
      _ndarrayOps2.default.assign((_y$tensor = y.tensor).pick.apply(_y$tensor, [0].concat(_toConsumableArray(yStepShape.map(function (s) {
        return null;
      })))), yStep.tensor);

      for (var i = 1, steps = x.tensor.shape[0]; i < steps; i++) {
        var _x$tensor2, _y$tensor2;

        var _xStep = new _Tensor2.default([], xStepShape);
        _ndarrayOps2.default.assign(_xStep.tensor, (_x$tensor2 = x.tensor).pick.apply(_x$tensor2, [i].concat(_toConsumableArray(xStepShape.map(function (s) {
          return null;
        })))));
        yStep = this.layer.call(_xStep);
        _ndarrayOps2.default.assign((_y$tensor2 = y.tensor).pick.apply(_y$tensor2, [i].concat(_toConsumableArray(yStepShape.map(function (s) {
          return null;
        })))), yStep.tensor);
      }

      x.tensor = y.tensor;
      return x;
    }
  }]);

  return TimeDistributed;
}(_Layer3.default);

exports.default = TimeDistributed;