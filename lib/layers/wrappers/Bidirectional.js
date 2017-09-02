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

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _recurrent = require('../recurrent');

var recurrentLayers = _interopRequireWildcard(_recurrent);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Bidirectional wrapper layer class
 */
var Bidirectional = function (_Layer) {
  _inherits(Bidirectional, _Layer);

  /**
   * Creates a Bidirectional wrapper layer
   * @param {Layer} attrs.layer
   * @param {String} [attrs.merge_mode] - one of concat, mul, sum, ave
   */
  function Bidirectional() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Bidirectional);

    var _this = _possibleConstructorReturn(this, (Bidirectional.__proto__ || Object.getPrototypeOf(Bidirectional)).call(this, attrs));

    _this.layerClass = 'Bidirectional';

    var layer = attrs.layer,
        _attrs$merge_mode = attrs.merge_mode,
        merge_mode = _attrs$merge_mode === undefined ? 'concat' : _attrs$merge_mode;


    if (!layer) throw new Error('[Bidirectional] wrapped layer is undefined.');

    _this.forwardLayer = layer;

    var backwardLayerAttrs = {
      units: _this.forwardLayer.units,
      activation: _this.forwardLayer.activation,
      recurrent_activation: _this.forwardLayer.recurrentActivation,
      return_sequences: _this.forwardLayer.returnSequences,
      go_backwards: !_this.forwardLayer.goBackwards,
      stateful: _this.forwardLayer.stateful
    };
    _this.backwardLayer = new recurrentLayers[layer.layerClass](backwardLayerAttrs);

    _this.mergeMode = merge_mode;
    return _this;
  }

  /**
   * Method for setting layer weights
   * Passes weights to the wrapped layer
   * Here, the weights array is concatenated from the forward layer and the backward layer
   *
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(Bidirectional, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      this.forwardLayer.setWeights(weightsArr.slice(0, weightsArr.length / 2));
      this.backwardLayer.setWeights(weightsArr.slice(weightsArr.length / 2));
    }

    /**
     * Method for layer computational logic
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: 'call',
    value: function call(x) {
      var xForward = new _Tensor2.default(x.tensor.data, x.tensor.shape);
      var xBackward = new _Tensor2.default(x.tensor.data, x.tensor.shape);
      var yForward = this.forwardLayer.call(xForward);
      var yBackward = this.backwardLayer.call(xBackward);

      if (this.mergeMode === 'concat') {
        var outShape = yForward.tensor.shape.slice();
        outShape[outShape.length - 1] += yBackward.tensor.shape[outShape.length - 1];
        var y = new _Tensor2.default([], outShape);
        if (this.forwardLayer.returnSequences) {
          _ndarrayOps2.default.assign(y.tensor.hi(outShape[0], yForward.tensor.shape[1]).lo(0, 0), yForward.tensor);
          // when returnSequences = true, reverse results of backwardLayer before concat
          _ndarrayOps2.default.assign(y.tensor.hi(outShape[0], outShape[1]).lo(0, yForward.tensor.shape[1]), yBackward.tensor.step(-1));
        } else {
          _ndarrayOps2.default.assign(y.tensor.hi(yForward.tensor.shape[0]).lo(0), yForward.tensor);
          _ndarrayOps2.default.assign(y.tensor.hi(outShape[0]).lo(yForward.tensor.shape[0]), yBackward.tensor);
        }
        x.tensor = y.tensor;
      } else if (this.mergeMode === 'sum') {
        var _outShape = yForward.tensor.shape.slice();
        var _y = new _Tensor2.default([], _outShape);
        _ndarrayOps2.default.addeq(_y.tensor, yForward.tensor);
        _ndarrayOps2.default.addeq(_y.tensor, yBackward.tensor.step(-1));
        x.tensor = _y.tensor;
      } else if (this.mergeMode === 'mul') {
        var _outShape2 = yForward.tensor.shape.slice();
        var _y2 = new _Tensor2.default([], _outShape2);
        _ndarrayOps2.default.assigns(_y2.tensor, 1);
        _ndarrayOps2.default.muleq(_y2.tensor, yForward.tensor);
        _ndarrayOps2.default.muleq(_y2.tensor, yBackward.tensor.step(-1));
        x.tensor = _y2.tensor;
      } else if (this.mergeMode === 'ave') {
        var _outShape3 = yForward.tensor.shape.slice();
        var _y3 = new _Tensor2.default([], _outShape3);
        _ndarrayOps2.default.addeq(_y3.tensor, yForward.tensor);
        _ndarrayOps2.default.addeq(_y3.tensor, yBackward.tensor.step(-1));
        _ndarrayOps2.default.divseq(_y3.tensor, 2);
        x.tensor = _y3.tensor;
      }

      return x;
    }
  }]);

  return Bidirectional;
}(_Layer3.default);

exports.default = Bidirectional;