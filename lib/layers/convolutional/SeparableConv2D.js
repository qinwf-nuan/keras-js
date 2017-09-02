'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _activations = require('../../activations');

var activations = _interopRequireWildcard(_activations);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Conv2D2 = require('./Conv2D');

var _Conv2D3 = _interopRequireDefault(_Conv2D2);

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _ndarrayGemm = require('ndarray-gemm');

var _ndarrayGemm2 = _interopRequireDefault(_ndarrayGemm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * _DepthwiseConv2D layer class
 */
var _DepthwiseConv2D = function (_Conv2D) {
  _inherits(_DepthwiseConv2D, _Conv2D);

  function _DepthwiseConv2D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, _DepthwiseConv2D);

    return _possibleConstructorReturn(this, (_DepthwiseConv2D.__proto__ || Object.getPrototypeOf(_DepthwiseConv2D)).call(this, attrs));
  }

  /**
   * Convert input image to column matrix
   * @param {Tensor} x
   * @returns {Tensor} x
   */


  _createClass(_DepthwiseConv2D, [{
    key: '_im2col',
    value: function _im2col(x) {
      var _x$tensor$shape = _slicedToArray(x.tensor.shape, 3),
          inputRows = _x$tensor$shape[0],
          inputCols = _x$tensor$shape[1],
          inputChannels = _x$tensor$shape[2];

      var nbRow = this.kernelShape[1];
      var nbCol = this.kernelShape[2];
      var outputRows = this.outputShape[0];
      var outputCols = this.outputShape[1];
      var nbPatches = outputRows * outputCols;
      var patchLen = nbRow * nbCol;

      if (!this._imColsMat) {
        this._imColsMat = new _Tensor2.default([], [nbPatches * inputChannels, patchLen]);
      }

      var patch = new _Tensor2.default([], [nbRow, nbCol, 1]);
      var offset = 0;
      for (var c = 0; c < inputChannels; c++) {
        for (var i = 0, limit = inputRows - nbRow; i <= limit; i += this.strides[0]) {
          for (var j = 0, _limit = inputCols - nbCol; j <= _limit; j += this.strides[1]) {
            _ndarrayOps2.default.assign(patch.tensor, x.tensor.hi(i + nbRow, j + nbCol, c + 1).lo(i, j, c));
            this._imColsMat.tensor.data.set(patch.tensor.data, offset);
            offset += patchLen;
          }
        }
      }

      if (this._useWeblas) {
        this._imColsMat.createWeblasTensor();
      }
      return this._imColsMat;
    }

    /**
     * Convert filter weights to row matrix
     * @returns {Tensor|weblas.pipeline.Tensor} wRowsMat
     */

  }, {
    key: '_w2row',
    value: function _w2row() {
      var inputChannels = this.weights['kernel'].tensor.shape[2];

      var _kernelShape = _slicedToArray(this.kernelShape, 3),
          nbFilter = _kernelShape[0],
          nbRow = _kernelShape[1],
          nbCol = _kernelShape[2];

      var patchLen = nbRow * nbCol;

      this._wRowsMat = new _Tensor2.default([], [patchLen, nbFilter * inputChannels]);

      var patch = new _Tensor2.default([], [nbRow, nbCol]);
      var patchRaveled = new _Tensor2.default([], [patchLen]);
      var p = 0;
      for (var c = 0; c < inputChannels; c++) {
        for (var n = 0; n < nbFilter; n++) {
          _ndarrayOps2.default.assign(patch.tensor, this.weights['kernel'].tensor.pick(null, null, c, n));
          patchRaveled.replaceTensorData(patch.tensor.data);
          _ndarrayOps2.default.assign(this._wRowsMat.tensor.pick(null, p), patchRaveled.tensor);
          p += 1;
        }
      }

      return this._wRowsMat;
    }

    /**
     * Method for layer computational logic
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: 'call',
    value: function call(x) {
      this._calcOutputShape(x.tensor.shape);
      this._padInput(x);

      this._im2col(x);

      var nbFilter = this.kernelShape[0];
      var outputRows = this.outputShape[0];
      var outputCols = this.outputShape[1];
      var nbPatches = outputRows * outputCols;
      var matMul = new _Tensor2.default([], [nbPatches * x.tensor.shape[2], nbFilter * x.tensor.shape[2]]);

      if (this._useWeblas && !(this._imColsMat._gpuMaxSizeExceeded || this._wRowsMat._gpuMaxSizeExceeded)) {
        // GPU
        matMul.tensor.data = weblas.pipeline.sgemm(1, this._imColsMat.weblasTensor, this._wRowsMat.weblasTensor, 1, this._zerosVec.weblasTensor).transfer();
      } else {
        // CPU
        (0, _ndarrayGemm2.default)(matMul.tensor, this._imColsMat.tensor, this._wRowsMat.tensor, 1, 1);
      }

      var output = new _Tensor2.default([], [outputRows, outputCols, x.tensor.shape[2] * nbFilter]);
      var outputDataLength = outputRows * outputCols * x.tensor.shape[2] * nbFilter;
      var dataFiltered = new Float32Array(outputDataLength);
      for (var c = 0; c < x.tensor.shape[2]; c++) {
        for (var i = 0, n = c * outputDataLength + c * nbFilter, len = (c + 1) * outputDataLength; n < len; i++, n += nbFilter * x.tensor.shape[2]) {
          for (var m = 0; m < nbFilter; m++) {
            dataFiltered[n + m - c * outputDataLength] = matMul.tensor.data[n + m];
          }
        }
      }
      output.replaceTensorData(dataFiltered);

      x.tensor = output.tensor;

      return x;
    }
  }]);

  return _DepthwiseConv2D;
}(_Conv2D3.default);

/**
 * SeparableConv2D layer class
 */


var SeparableConv2D = function (_Layer) {
  _inherits(SeparableConv2D, _Layer);

  /**
   * Creates a SeparableConv2D layer
   * @param {Number} attrs.filters - Number of convolution filters to use.
   * @param {Array<Number>|Number} attrs.kernel_size - Size of the convolution kernel.
   * @param {Object} [attrs] - layer attributes
   */
  function SeparableConv2D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SeparableConv2D);

    var _this2 = _possibleConstructorReturn(this, (SeparableConv2D.__proto__ || Object.getPrototypeOf(SeparableConv2D)).call(this, attrs));

    _this2.layerClass = 'SeparableConv2D';

    var _attrs$filters = attrs.filters,
        filters = _attrs$filters === undefined ? 1 : _attrs$filters,
        _attrs$kernel_size = attrs.kernel_size,
        kernel_size = _attrs$kernel_size === undefined ? [1, 1] : _attrs$kernel_size,
        _attrs$strides = attrs.strides,
        strides = _attrs$strides === undefined ? [1, 1] : _attrs$strides,
        _attrs$padding = attrs.padding,
        padding = _attrs$padding === undefined ? 'valid' : _attrs$padding,
        _attrs$data_format = attrs.data_format,
        data_format = _attrs$data_format === undefined ? 'channels_last' : _attrs$data_format,
        _attrs$depth_multipli = attrs.depth_multiplier,
        depth_multiplier = _attrs$depth_multipli === undefined ? 1 : _attrs$depth_multipli,
        _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'linear' : _attrs$activation,
        _attrs$use_bias = attrs.use_bias,
        use_bias = _attrs$use_bias === undefined ? true : _attrs$use_bias;


    if (Array.isArray(kernel_size)) {
      _this2.kernelShape = [filters].concat(_toConsumableArray(kernel_size));
    } else {
      _this2.kernelShape = [filters, kernel_size, kernel_size];
    }

    if (Array.isArray(strides)) {
      _this2.strides = strides;
    } else {
      _this2.strides = [strides, strides];
    }

    if (padding === 'valid' || padding === 'same') {
      _this2.padding = padding;
    } else {
      throw new Error(`${_this2.name} [Conv2D layer] Invalid padding.`);
    }

    if (data_format === 'channels_last' || data_format === 'channels_first') {
      _this2.dataFormat = data_format;
    } else {
      throw new Error(`${_this2.name} [Conv2D layer] Only channels_last and channels_first data formats are allowed.`);
    }

    _this2.activation = activation;
    _this2.activationFunc = activations[activation];

    if (padding === 'valid' || padding === 'same') {
      _this2.padding = padding;
    } else {
      throw new Error(`${_this2.name} [SeparableConv2D layer] Invalid padding.`);
    }

    _this2.use_bias = use_bias;

    // Layer weights specification
    _this2.params = _this2.use_bias ? ['depthwise_kernel', 'pointwise_kernel', 'bias'] : ['depthwise_kernel', 'pointwise_kernel'];

    // SeparableConv2D has two components: depthwise, and pointwise.
    // Activation function and bias is applied at the end.
    // Subsampling (striding) only performed on depthwise part, not the pointwise part.
    _this2.depthwiseConvAttrs = {
      filters: depth_multiplier,
      kernel_size: [_this2.kernelShape[1], _this2.kernelShape[2]],
      strides: _this2.strides,
      padding,
      data_format,
      activation: 'linear',
      use_bias: false,
      gpu: attrs.gpu
    };
    _this2.pointwiseConvAttrs = {
      filters,
      kernel_size: [1, 1],
      strides: [1, 1],
      padding,
      data_format,
      activation: 'linear',
      use_bias,
      gpu: attrs.gpu
    };
    return _this2;
  }

  /**
   * Method for setting layer weights
   * Override `super` method since weights must be set in component Conv2D layers
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(SeparableConv2D, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      this._depthwiseConv = new _DepthwiseConv2D(this.depthwiseConvAttrs);
      this._depthwiseConv.setWeights(weightsArr.slice(0, 1));
      this._pointwiseConv = new _Conv2D3.default(this.pointwiseConvAttrs);
      this._pointwiseConv.setWeights(weightsArr.slice(1, 3));
    }

    /**
     * Method for layer computational logic
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: 'call',
    value: function call(x) {
      // Perform depthwise ops
      var depthwiseOutput = this._depthwiseConv.call(x);

      // Perform depthwise ops
      var pointwiseOutput = this._pointwiseConv.call(depthwiseOutput);

      x.tensor = pointwiseOutput.tensor;

      // activation
      this.activationFunc(x);

      return x;
    }
  }]);

  return SeparableConv2D;
}(_Layer3.default);

exports.default = SeparableConv2D;