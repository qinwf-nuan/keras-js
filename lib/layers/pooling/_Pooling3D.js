'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
 * _Pooling3D layer class
 */
var _Pooling3D = function (_Layer) {
  _inherits(_Pooling3D, _Layer);

  /**
   * Creates a _Pooling3D layer
   */
  function _Pooling3D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, _Pooling3D);

    var _this = _possibleConstructorReturn(this, (_Pooling3D.__proto__ || Object.getPrototypeOf(_Pooling3D)).call(this, attrs));

    _this.layerClass = '_Pooling3D';

    var _attrs$pool_size = attrs.pool_size,
        pool_size = _attrs$pool_size === undefined ? [2, 2, 2] : _attrs$pool_size,
        _attrs$strides = attrs.strides,
        strides = _attrs$strides === undefined ? null : _attrs$strides,
        _attrs$padding = attrs.padding,
        padding = _attrs$padding === undefined ? 'valid' : _attrs$padding,
        _attrs$data_format = attrs.data_format,
        data_format = _attrs$data_format === undefined ? 'channels_last' : _attrs$data_format;


    if (Array.isArray(pool_size)) {
      _this.poolSize = pool_size;
    } else {
      _this.poolSize = [pool_size, pool_size, pool_size];
    }

    if (Array.isArray(strides)) {
      _this.strides = strides;
    } else if (strides !== null) {
      _this.strides = [strides, strides, strides];
    } else {
      _this.strides = _this.poolSize;
    }

    _this.padding = padding;
    _this.dataFormat = data_format;

    // default pooling function
    // can be `max` or `average`
    _this.poolingFunc = 'max';
    return _this;
  }

  /**
   * Method for computing output dimensions and padding, based on input
   * dimensions, kernel size, and padding mode.
   * For tensorflow implementation of padding, see:
   * https://github.com/tensorflow/tensorflow/blob/master/tensorflow/core/framework/common_shape_fns.cc
   * @param {Tensor} x
   */


  _createClass(_Pooling3D, [{
    key: '_calcOutputShape',
    value: function _calcOutputShape(x) {
      var _x$tensor$shape = _slicedToArray(x.tensor.shape, 4),
          inputDim1 = _x$tensor$shape[0],
          inputDim2 = _x$tensor$shape[1],
          inputDim3 = _x$tensor$shape[2],
          inputChannels = _x$tensor$shape[3];

      var _poolSize = _slicedToArray(this.poolSize, 3),
          poolDim1 = _poolSize[0],
          poolDim2 = _poolSize[1],
          poolDim3 = _poolSize[2];

      var outputDim1 = this.padding === 'same' ? Math.floor((inputDim1 + this.strides[0] - 1) / this.strides[0]) : Math.floor((inputDim1 - poolDim1 + this.strides[0]) / this.strides[0]);
      var outputDim2 = this.padding === 'same' ? Math.floor((inputDim2 + this.strides[1] - 1) / this.strides[1]) : Math.floor((inputDim2 - poolDim2 + this.strides[1]) / this.strides[1]);
      var outputDim3 = this.padding === 'same' ? Math.floor((inputDim3 + this.strides[2] - 1) / this.strides[2]) : Math.floor((inputDim3 - poolDim3 + this.strides[2]) / this.strides[2]);

      var paddingDim1 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim1 - 1) * this.strides[0] + poolDim1 - inputDim1)) : 0;
      var paddingDim2 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim2 - 1) * this.strides[1] + poolDim2 - inputDim2)) : 0;
      var paddingDim3 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim3 - 1) * this.strides[2] + poolDim3 - inputDim3)) : 0;
      var paddingDim1Before = Math.floor(paddingDim1 / 2);
      var paddingDim1After = paddingDim1 - paddingDim1Before;
      var paddingDim2Before = Math.floor(paddingDim2 / 2);
      var paddingDim2After = paddingDim2 - paddingDim2Before;
      var paddingDim3Before = Math.floor(paddingDim3 / 2);
      var paddingDim3After = paddingDim3 - paddingDim3Before;

      this.outputShape = [outputDim1, outputDim2, outputDim3, inputChannels];
      this.inputPadding = [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After];
    }

    /**
     * Pad input tensor if necessary, for padding='same'.
     * See above for notes on calculating padding.
     * For max, we pad with -infinity.
     * For average we pad with zero.
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: '_padInput',
    value: function _padInput(x) {
      if (this.padding === 'same') {
        var _x$tensor$shape2 = _slicedToArray(x.tensor.shape, 4),
            inputDim1 = _x$tensor$shape2[0],
            inputDim2 = _x$tensor$shape2[1],
            inputDim3 = _x$tensor$shape2[2],
            inputChannels = _x$tensor$shape2[3];

        var _inputPadding = _slicedToArray(this.inputPadding, 6),
            paddingDim1Before = _inputPadding[0],
            paddingDim1After = _inputPadding[1],
            paddingDim2Before = _inputPadding[2],
            paddingDim2After = _inputPadding[3],
            paddingDim3Before = _inputPadding[4],
            paddingDim3After = _inputPadding[5];

        var newDim1 = inputDim1 + paddingDim1Before + paddingDim1After;
        var newDim2 = inputDim2 + paddingDim2Before + paddingDim2After;
        var newDim3 = inputDim3 + paddingDim3Before + paddingDim3After;

        var _x = new _Tensor2.default([], [newDim1, newDim2, newDim3, inputChannels]);
        if (this.poolingFunc === 'max') {
          _ndarrayOps2.default.assigns(_x.tensor, Number.NEGATIVE_INFINITY);
        }

        _ndarrayOps2.default.assign(_x.tensor.hi(inputDim1 + paddingDim1Before, inputDim2 + paddingDim2Before, inputDim3 + paddingDim3Before, inputChannels).lo(paddingDim1Before, paddingDim2Before, paddingDim3Before, 0), x.tensor);
        x.tensor = _x.tensor;
      }
      return x;
    }

    /**
     * Method for layer computational logic
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: 'call',
    value: function call(x) {
      if (this.poolingFunc !== 'max' && this.poolingFunc !== 'average') {
        throw new Error(`[pooling._Pooling3D] pooling function must be max or average.`);
      }

      // convert to channels_last ordering
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(1, 2, 3, 0);
      }

      this._calcOutputShape(x);
      this._padInput(x);

      var _x$tensor$shape3 = _slicedToArray(x.tensor.shape, 4),
          inputDim1 = _x$tensor$shape3[0],
          inputDim2 = _x$tensor$shape3[1],
          inputDim3 = _x$tensor$shape3[2],
          inputChannels = _x$tensor$shape3[3];

      var _poolSize2 = _slicedToArray(this.poolSize, 3),
          poolDim1 = _poolSize2[0],
          poolDim2 = _poolSize2[1],
          poolDim3 = _poolSize2[2];

      var y = new _Tensor2.default([], this.outputShape);
      var patch = new _Tensor2.default([], [poolDim1, poolDim2, poolDim3, inputChannels]);

      // keep track of padding since these values are not included in pooling
      // for max, we can ignore since padding values are set to -infinity

      var _inputPadding2 = _slicedToArray(this.inputPadding, 6),
          paddingDim1Before = _inputPadding2[0],
          paddingDim1After = _inputPadding2[1],
          paddingDim2Before = _inputPadding2[2],
          paddingDim2After = _inputPadding2[3],
          paddingDim3Before = _inputPadding2[4],
          paddingDim3After = _inputPadding2[5];

      for (var i = 0, _i = 0; i <= inputDim1 - poolDim1; i += this.strides[0], _i++) {
        var dim1InPadding = 0;
        if (i < paddingDim1Before) {
          dim1InPadding = paddingDim1Before - i;
        } else if (i + poolDim1 > inputDim1 - paddingDim1After) {
          dim1InPadding = i + poolDim1 - (inputDim1 - paddingDim1After);
        }

        for (var j = 0, _j = 0; j <= inputDim2 - poolDim2; j += this.strides[1], _j++) {
          var dim2InPadding = 0;
          if (j < paddingDim2Before) {
            dim2InPadding = paddingDim2Before - j;
          } else if (j + poolDim2 > inputDim2 - paddingDim2After) {
            dim2InPadding = j + poolDim2 - (inputDim2 - paddingDim2After);
          }

          for (var k = 0, _k = 0; k <= inputDim3 - poolDim3; k += this.strides[2], _k++) {
            var dim3InPadding = 0;
            if (k < paddingDim3Before) {
              dim3InPadding = paddingDim3Before - k;
            } else if (k + poolDim3 > inputDim3 - paddingDim3After) {
              dim3InPadding = k + poolDim3 - (inputDim3 - paddingDim3After);
            }

            _ndarrayOps2.default.assign(patch.tensor, x.tensor.hi(i + poolDim1, j + poolDim2, k + poolDim3, inputChannels).lo(i, j, k, 0));
            for (var c = 0; c < inputChannels; c++) {
              if (this.poolingFunc === 'max') {
                y.tensor.set(_i, _j, _k, c, _ndarrayOps2.default.sup(patch.tensor.pick(null, null, null, c)));
              } else if (this.poolingFunc === 'average') {
                var nbCellsEffective = (poolDim1 - dim1InPadding) * (poolDim2 - dim2InPadding) * (poolDim3 - dim3InPadding);
                y.tensor.set(_i, _j, _k, c, _ndarrayOps2.default.sum(patch.tensor.pick(null, null, null, c)) / nbCellsEffective);
              }
            }
          }
        }
      }

      x.tensor = y.tensor;

      // convert back to channels_first ordering if necessary
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(3, 0, 1, 2);
      }

      return x;
    }
  }]);

  return _Pooling3D;
}(_Layer3.default);

exports.default = _Pooling3D;