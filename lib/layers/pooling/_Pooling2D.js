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
 * _Pooling2D layer class
 */
var _Pooling2D = function (_Layer) {
  _inherits(_Pooling2D, _Layer);

  /**
   * Creates a _Pooling2D layer
   */
  function _Pooling2D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, _Pooling2D);

    var _this = _possibleConstructorReturn(this, (_Pooling2D.__proto__ || Object.getPrototypeOf(_Pooling2D)).call(this, attrs));

    _this.layerClass = '_Pooling2D';

    var _attrs$pool_size = attrs.pool_size,
        pool_size = _attrs$pool_size === undefined ? [2, 2] : _attrs$pool_size,
        _attrs$strides = attrs.strides,
        strides = _attrs$strides === undefined ? null : _attrs$strides,
        _attrs$padding = attrs.padding,
        padding = _attrs$padding === undefined ? 'valid' : _attrs$padding,
        _attrs$data_format = attrs.data_format,
        data_format = _attrs$data_format === undefined ? 'channels_last' : _attrs$data_format;


    if (Array.isArray(pool_size)) {
      _this.poolSize = pool_size;
    } else {
      _this.poolSize = [pool_size, pool_size];
    }

    if (Array.isArray(strides)) {
      _this.strides = strides;
    } else if (strides !== null) {
      _this.strides = [strides, strides];
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
   * @param {number[]} inputShape
   */


  _createClass(_Pooling2D, [{
    key: '_calcOutputShape',
    value: function _calcOutputShape(inputShape) {
      var _inputShape = _slicedToArray(inputShape, 3),
          inputRows = _inputShape[0],
          inputCols = _inputShape[1],
          inputChannels = _inputShape[2];

      var _poolSize = _slicedToArray(this.poolSize, 2),
          nbRow = _poolSize[0],
          nbCol = _poolSize[1];

      var outputRows = this.padding === 'same' ? Math.floor((inputRows + this.strides[0] - 1) / this.strides[0]) : Math.floor((inputRows - nbRow + this.strides[0]) / this.strides[0]);
      var outputCols = this.padding === 'same' ? Math.floor((inputCols + this.strides[1] - 1) / this.strides[1]) : Math.floor((inputCols - nbCol + this.strides[1]) / this.strides[1]);

      var paddingRow = this.padding === 'same' ? Math.max(0, Math.floor((outputRows - 1) * this.strides[0] + nbRow - inputRows)) : 0;
      var paddingCol = this.padding === 'same' ? Math.max(0, Math.floor((outputCols - 1) * this.strides[1] + nbCol - inputCols)) : 0;
      var paddingRowBefore = Math.floor(paddingRow / 2);
      var paddingRowAfter = paddingRow - paddingRowBefore;
      var paddingColBefore = Math.floor(paddingCol / 2);
      var paddingColAfter = paddingCol - paddingColBefore;

      this.outputShape = [outputRows, outputCols, inputChannels];
      this.inputPadding = [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter];
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
        var _x$tensor$shape = _slicedToArray(x.tensor.shape, 3),
            inputRows = _x$tensor$shape[0],
            inputCols = _x$tensor$shape[1],
            inputChannels = _x$tensor$shape[2];

        var _inputPadding = _slicedToArray(this.inputPadding, 4),
            paddingRowBefore = _inputPadding[0],
            paddingRowAfter = _inputPadding[1],
            paddingColBefore = _inputPadding[2],
            paddingColAfter = _inputPadding[3];

        var newRows = inputRows + paddingRowBefore + paddingRowAfter;
        var newCols = inputCols + paddingColBefore + paddingColAfter;

        var _x = new _Tensor2.default([], [newRows, newCols, inputChannels]);
        if (this.poolingFunc === 'max') {
          _ndarrayOps2.default.assigns(_x.tensor, Number.NEGATIVE_INFINITY);
        }

        _ndarrayOps2.default.assign(_x.tensor.hi(inputRows + paddingRowBefore, inputCols + paddingColBefore, inputChannels).lo(paddingRowBefore, paddingColBefore, 0), x.tensor);
        x.tensor = _x.tensor;
      }
      return x;
    }

    /**
     * Creates a index mapping from the 2D-tiled input tensor with associated
     * 3D tensor shape to the representation required prior to pooling.
     * @param {number[]} inputShape
     */

  }, {
    key: '_poolIndexMapping',
    value: function _poolIndexMapping(inputShape) {
      if (this._poolIndicesPerChannel) {
        return;
      }

      var inputRows = inputShape[0];
      var inputCols = inputShape[1];

      var indicesRow = new _Tensor2.default([], [inputRows, inputCols]);
      var index = 0;
      for (var i = 0; i < inputRows; i++) {
        for (var j = 0; j < inputCols; j++) {
          indicesRow.tensor.set(i, j, index);
          index += 1;
        }
      }

      // padding for border mode 'same'
      if (this.padding === 'same') {
        var _inputPadding2 = _slicedToArray(this.inputPadding, 4),
            paddingRowBefore = _inputPadding2[0],
            paddingRowAfter = _inputPadding2[1],
            paddingColBefore = _inputPadding2[2],
            paddingColAfter = _inputPadding2[3];

        inputRows = inputRows + paddingRowBefore + paddingRowAfter;
        inputCols = inputCols + paddingColBefore + paddingColAfter;
        var _indicesRow = new _Tensor2.default([], [inputRows, inputCols]);
        _ndarrayOps2.default.assigns(_indicesRow.tensor, -1);
        _ndarrayOps2.default.assign(_indicesRow.tensor.hi(inputShape[0] + paddingRowBefore, inputShape[1] + paddingColBefore).lo(paddingRowBefore, paddingColBefore), indicesRow.tensor);
        indicesRow.tensor = _indicesRow.tensor;
      }

      var _poolSize2 = _slicedToArray(this.poolSize, 2),
          nbRow = _poolSize2[0],
          nbCol = _poolSize2[1];

      var outputRows = this.outputShape[0];
      var outputCols = this.outputShape[1];

      this._poolIndicesPerChannel = new _Tensor2.default([], [outputRows * outputCols, nbRow * nbCol]);

      var patchRow = new _Tensor2.default([], [nbRow, nbCol]);
      var offset = 0;
      for (var _i2 = 0, limit = inputRows - nbRow; _i2 <= limit; _i2 += this.strides[0]) {
        for (var _j2 = 0, _limit = inputCols - nbCol; _j2 <= _limit; _j2 += this.strides[1]) {
          _ndarrayOps2.default.assign(patchRow.tensor, indicesRow.tensor.hi(_i2 + nbRow, _j2 + nbCol).lo(_i2, _j2));
          this._poolIndicesPerChannel.tensor.data.set(patchRow.tensor.data, offset);
          offset += nbRow * nbCol;
        }
      }
      this._poolIndicesPerChannel.createWeblasTensor();
    }

    /**
     * Runs layer computational logic in pipeline mode
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: '_callPipelineMode',
    value: function _callPipelineMode(x) {
      if (!x.weblasTensor) {
        throw new Error('Variable passed in does not contain weblas tensor.');
      }

      this._calcOutputShape(x._actualShape);
      this._poolIndexMapping(x._actualShape);

      x.weblasTensor = this.webglPooling2D.call(x.weblasTensor, this._poolIndicesPerChannel.weblasTensor);

      x._fromPipeline = true;
      x._actualShape = this.outputShape;

      return x;
    }

    /**
     * Runs layer computational logic in regular mode
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: '_callRegularMode',
    value: function _callRegularMode(x) {
      if (!x.tensor) {
        throw new Error('Variable passed in does not contain tensor.');
      }

      // convert to channels_last ordering
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(1, 2, 0);
      }

      this._calcOutputShape(x.tensor.shape);
      this._padInput(x);

      var _x$tensor$shape2 = _slicedToArray(x.tensor.shape, 3),
          inputRows = _x$tensor$shape2[0],
          inputCols = _x$tensor$shape2[1],
          inputChannels = _x$tensor$shape2[2];

      var _poolSize3 = _slicedToArray(this.poolSize, 2),
          nbRow = _poolSize3[0],
          nbCol = _poolSize3[1];

      var y = new _Tensor2.default([], this.outputShape);
      var patch = new _Tensor2.default([], [nbRow, nbCol, inputChannels]);

      // keep track of padding since these values are not included in pooling
      // for max, we can ignore since padding values are set to -infinity

      var _inputPadding3 = _slicedToArray(this.inputPadding, 4),
          paddingRowBefore = _inputPadding3[0],
          paddingRowAfter = _inputPadding3[1],
          paddingColBefore = _inputPadding3[2],
          paddingColAfter = _inputPadding3[3];

      for (var i = 0, _i = 0; i <= inputRows - nbRow; i += this.strides[0], _i++) {
        var nbRowInPadding = 0;
        if (i < paddingRowBefore) {
          nbRowInPadding = paddingRowBefore - i;
        } else if (i + nbRow > inputRows - paddingRowAfter) {
          nbRowInPadding = i + nbRow - (inputRows - paddingRowAfter);
        }

        for (var j = 0, _j = 0; j <= inputCols - nbCol; j += this.strides[1], _j++) {
          var nbColInPadding = 0;
          if (j < paddingColBefore) {
            nbColInPadding = paddingColBefore - j;
          } else if (j + nbCol > inputCols - paddingColAfter) {
            nbColInPadding = j + nbCol - (inputCols - paddingColAfter);
          }

          _ndarrayOps2.default.assign(patch.tensor, x.tensor.hi(i + nbRow, j + nbCol, inputChannels).lo(i, j, 0));
          for (var c = 0; c < inputChannels; c++) {
            if (this.poolingFunc === 'max') {
              y.tensor.set(_i, _j, c, _ndarrayOps2.default.sup(patch.tensor.pick(null, null, c)));
            } else if (this.poolingFunc === 'average') {
              var nbCellsEffective = (nbRow - nbRowInPadding) * (nbCol - nbColInPadding);
              y.tensor.set(_i, _j, c, _ndarrayOps2.default.sum(patch.tensor.pick(null, null, c)) / nbCellsEffective);
            }
          }
        }
      }

      x.tensor = y.tensor;

      // convert back to channels_first ordering if necessary
      if (this.dataFormat === 'channels_first') {
        x.tensor = x.tensor.transpose(2, 0, 1);
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
      if (this._pipelineEnabled && x._fromPipeline) {
        return this._callPipelineMode(x);
      } else {
        return this._callRegularMode(x);
      }
    }
  }]);

  return _Pooling2D;
}(_Layer3.default);

exports.default = _Pooling2D;