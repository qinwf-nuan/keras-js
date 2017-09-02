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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * _Pooling1D layer class
 */
var _Pooling1D = function (_Layer) {
  _inherits(_Pooling1D, _Layer);

  /**
   * Creates a _Pooling1D layer
   */
  function _Pooling1D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, _Pooling1D);

    var _this = _possibleConstructorReturn(this, (_Pooling1D.__proto__ || Object.getPrototypeOf(_Pooling1D)).call(this, attrs));

    _this.layerClass = '_Pooling1D';

    var _attrs$pool_size = attrs.pool_size,
        pool_size = _attrs$pool_size === undefined ? 2 : _attrs$pool_size,
        _attrs$strides = attrs.strides,
        strides = _attrs$strides === undefined ? null : _attrs$strides,
        _attrs$padding = attrs.padding,
        padding = _attrs$padding === undefined ? 'valid' : _attrs$padding;


    _this.poolSize = pool_size;
    _this.strides = strides === null ? _this.poolSize : strides;
    _this.padding = padding;

    // default pooling function
    // can be `max` or `average`
    _this.poolingFunc = 'max';
    return _this;
  }

  /**
   * Method for layer computational logic
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(_Pooling1D, [{
    key: 'call',
    value: function call(x) {
      if (this.poolingFunc !== 'max' && this.poolingFunc !== 'average') {
        throw new Error(`[pooling._Pooling1D] pooling function must be max or average.`);
      }

      var stepsNew = this.padding === 'valid' ? Math.floor((x.tensor.shape[0] - this.poolSize + this.strides) / this.strides) : Math.floor((x.tensor.shape[0] + this.strides - 1) / this.strides);

      var y = new _Tensor2.default([], [stepsNew, x.tensor.shape[1]]);
      var yStep = new _Tensor2.default([], [x.tensor.shape[1]]);

      // in padding same, start negative from beyond step 0
      var step = this.padding === 'valid' ? 0 : Math.min(0, Math.ceil((x.tensor.shape[0] - (stepsNew - 1) * this.strides - this.poolSize) / 2));

      for (var i = 0; i < stepsNew; i++) {
        var _step = Math.max(0, step);
        var limit = this.poolSize + Math.min(0, step);
        _ndarrayOps2.default.assign(yStep.tensor, x.tensor.pick(_step, null));

        var count = 1;
        for (var j = 1; j < limit; j++) {
          if (_step + j > x.tensor.shape[0] - 1) {
            break;
          }
          if (this.poolingFunc === 'max') {
            _ndarrayOps2.default.maxeq(yStep.tensor, x.tensor.pick(_step + j, null));
          } else if (this.poolingFunc === 'average') {
            _ndarrayOps2.default.addeq(yStep.tensor, x.tensor.pick(_step + j, null));
          }
          count += 1;
        }

        if (this.poolingFunc === 'average') {
          _ndarrayOps2.default.divseq(yStep.tensor, count);
        }

        _ndarrayOps2.default.assign(y.tensor.pick(i, null), yStep.tensor);
        step += this.strides;
      }

      x.tensor = y.tensor;
      return x;
    }
  }]);

  return _Pooling1D;
}(_Layer3.default);

exports.default = _Pooling1D;