'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _activations = require('../../activations');

var activations = _interopRequireWildcard(_activations);

var _WebGL = require('../../WebGL2');

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _ndarrayGemm = require('ndarray-gemm');

var _ndarrayGemm2 = _interopRequireDefault(_ndarrayGemm);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Conv2DTranspose layer class
 */
var Conv2DTranspose = function (_Layer) {
  _inherits(Conv2DTranspose, _Layer);

  /**
   * Creates a Conv2DTranspose layer
   * @param {Number} attrs.filters - Number of convolution filters to use.
   * @param {Array<Number>|Number} attrs.kernel_size - Size of the convolution kernel.
   * @param {Object} [attrs] - layer attributes
   */
  function Conv2DTranspose() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Conv2DTranspose);

    var _this = _possibleConstructorReturn(this, (Conv2DTranspose.__proto__ || Object.getPrototypeOf(Conv2DTranspose)).call(this, attrs));

    _this.layerClass = 'Conv2DTranspose';

    var _attrs$filters = attrs.filters,
        filters = _attrs$filters === undefined ? 1 : _attrs$filters,
        _attrs$kernel_size = attrs.kernel_size,
        kernel_size = _attrs$kernel_size === undefined ? [3, 3] : _attrs$kernel_size,
        _attrs$strides = attrs.strides,
        strides = _attrs$strides === undefined ? [1, 1] : _attrs$strides,
        _attrs$padding = attrs.padding,
        padding = _attrs$padding === undefined ? 'valid' : _attrs$padding,
        _attrs$data_format = attrs.data_format,
        data_format = _attrs$data_format === undefined ? 'channels_last' : _attrs$data_format,
        _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'linear' : _attrs$activation,
        _attrs$use_bias = attrs.use_bias,
        use_bias = _attrs$use_bias === undefined ? true : _attrs$use_bias;


    if (Array.isArray(kernel_size)) {
      _this.kernelShape = [filters].concat(_toConsumableArray(kernel_size));
    } else {
      _this.kernelShape = [filters, kernel_size, kernel_size];
    }

    if (Array.isArray(strides)) {
      _this.strides = strides;
    } else {
      _this.strides = [strides, strides];
    }

    if (padding === 'valid' || padding === 'same') {
      _this.padding = padding;
    } else {
      throw new Error(`${_this.name} [Conv2DTranspose layer] Invalid padding.`);
    }

    if (data_format === 'channels_last' || data_format === 'channels_first') {
      _this.dataFormat = data_format;
    } else {
      throw new Error(`${_this.name} [Conv2DTranspose layer] Only channels_last and channels_first data formats are allowed.`);
    }

    _this.activation = activation;
    _this.activationFunc = activations[activation];

    _this.use_bias = use_bias;

    // Layer weights specification
    _this.params = _this.use_bias ? ['kernel', 'bias'] : ['kernel'];

    // GPU setup
    if (_this.gpu) {
      _this.matMulProgram = _WebGL.webgl2.compileProgram(require('../../matMul.webgl2.glsl'));
      _this.convTransposeProgram = _WebGL.webgl2.compileProgram(require('./Conv2DTranspose.webgl2.glsl'));
      _this.activationProgram = _WebGL.webgl2.compileProgram(require(`../../activations/${_this.activation}.webgl2.glsl`));
    }
    return _this;
  }

  /**
   * Method for setting layer weights. Extends `super` method.
   * W weight tensor is converted to `channels_last` mode if in `channels_first` mode.
   * In `channels_last` mode, W weight tensor has shape [nbRow, nbCol, inputChannels, nbFilter]
   * In `channels_first` mode, W weight tensor has shape [nbFilter, inputChannels, nbRow, nbCol]
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(Conv2DTranspose, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      if (this.dataFormat === 'channels_first') {
        weightsArr[0].tensor = weightsArr[0].tensor.transpose(2, 3, 1, 0);
      }
      _get(Conv2DTranspose.prototype.__proto__ || Object.getPrototypeOf(Conv2DTranspose.prototype), 'setWeights', this).call(this, weightsArr, false);

      this._w2row();

      if (this.gpu) {
        this.weights['kernel'] = this._wRowsMat;
        this.weights['kernel'].createGLTexture();
        if (this.use_bias) {
          this.weights['bias'].createGLTexture();
        }
      }
    }

    /**
     * Layer computational logic
     *
     * @param {Tensor} x
     * @returns {Tensor}
     */

  }, {
    key: 'call',
    value: function call(x) {
      if (this.gpu) {
        this._call_gpu(x);
      } else {
        this._call_cpu(x);
      }
      return this.output;
    }

    /**
     * Method for computing output dimensions and padding, based on input
     * dimensions, kernel size, and padding mode.
     * For tensorflow implementation of padding, see:
     * https://github.com/tensorflow/tensorflow/blob/master/tensorflow/core/framework/common_shape_fns.cc
     * For deconvolution, we will "take away" padding from the output rather than add padding
     * to the input.
     * For more details on calculating output shapes and padding for transposed convolutions
     * (deconvolution here), see: https://arxiv.org/pdf/1603.07285v1.pdf
     * @param {number[]} inputShape
     */

  }, {
    key: '_calcOutputShape',
    value: function _calcOutputShape(inputShape) {
      var inputRows = inputShape[0];
      var inputCols = inputShape[1];

      var _kernelShape = _slicedToArray(this.kernelShape, 3),
          nbFilter = _kernelShape[0],
          nbRow = _kernelShape[1],
          nbCol = _kernelShape[2];

      var outputRows = this.padding === 'same' ? inputRows * this.strides[0] : inputRows * this.strides[0] + Math.max(nbRow - this.strides[0], 0);
      var outputCols = this.padding === 'same' ? inputCols * this.strides[1] : inputCols * this.strides[1] + Math.max(nbCol - this.strides[1], 0);
      var outputChannels = nbFilter;

      var paddingRow = this.padding === 'same' ? Math.max(0, Math.floor((inputRows - 1) * this.strides[0] + nbRow - outputRows)) : 0;
      var paddingCol = this.padding === 'same' ? Math.max(0, Math.floor((inputCols - 1) * this.strides[1] + nbCol - outputCols)) : 0;
      var paddingRowBefore = Math.floor(paddingRow / 2);
      var paddingRowAfter = paddingRow - paddingRowBefore;
      var paddingColBefore = Math.floor(paddingCol / 2);
      var paddingColAfter = paddingCol - paddingColBefore;

      this.outputShape = [outputRows, outputCols, outputChannels];
      this.outputPadding = [paddingRowBefore, paddingRowAfter, paddingColBefore, paddingColAfter];
    }

    /**
     * Convert input image to column matrix, along channels axis
     * shape: [inputRows, inputCols, inputChannels] -> [inputRows * inputCols, inputChannels]
     * @param {Tensor} x
     * @returns {Tensor}
     */

  }, {
    key: '_im2col',
    value: function _im2col(x) {
      var _x$tensor$shape = _slicedToArray(x.tensor.shape, 3),
          inputRows = _x$tensor$shape[0],
          inputCols = _x$tensor$shape[1],
          inputChannels = _x$tensor$shape[2];

      if (!this._imColsMat) {
        this._imColsMat = new _Tensor2.default([], [inputRows * inputCols, inputChannels]);
      }

      var channelRaveled = new _Tensor2.default([], [inputRows * inputCols]);
      var channel = new _Tensor2.default([], [inputRows, inputCols]);
      for (var c = 0; c < inputChannels; c++) {
        _ndarrayOps2.default.assign(channel.tensor, x.tensor.pick(null, null, c));
        channelRaveled.replaceTensorData(channel.tensor.data);
        _ndarrayOps2.default.assign(this._imColsMat.tensor.pick(null, c), channelRaveled.tensor);
      }
      if (this.gpu) {
        this._imColsMat.createGLTexture();
      }
      return this._imColsMat;
    }

    /**
     * Convert filter weights to row matrix, along channels axis
     * shape: [nbRow, nbCol, nbFilter, inputChannels] -> [inputChannels, nbRow * nbCol * nbFilter]
     * @returns {Tensor}
     */

  }, {
    key: '_w2row',
    value: function _w2row() {
      var _weights$kernel$tenso = _slicedToArray(this.weights['kernel'].tensor.shape, 4),
          nbRow = _weights$kernel$tenso[0],
          nbCol = _weights$kernel$tenso[1],
          nbFilter = _weights$kernel$tenso[2],
          inputChannels = _weights$kernel$tenso[3];

      this._wRowsMat = new _Tensor2.default([], [inputChannels, nbRow * nbCol * nbFilter]);

      var channelRaveled = new _Tensor2.default([], [nbRow * nbCol * nbFilter]);
      var channel = new _Tensor2.default([], [nbRow, nbCol, nbFilter]);
      for (var c = 0; c < inputChannels; c++) {
        _ndarrayOps2.default.assign(channel.tensor, this.weights['kernel'].tensor.pick(null, null, null, c));
        channelRaveled.replaceTensorData(channel.tensor.data);
        _ndarrayOps2.default.assign(this._wRowsMat.tensor.pick(c, null), channelRaveled.tensor);
      }

      return this._wRowsMat;
    }

    /**
     * In GPU mode, we work directly on 2D-tiled representations of the tensors.
     * After the matrix multiply step produce matrix Y, the final output Z at coordinate [i,j]
     * will be the summation of a number of elements of the matrix Y. Here, we calculate the
     * indices of matrix Y for each coordinate [i,j] of Z, and encode these index maps as
     * texture arrays.
     */

  }, {
    key: '_createIndexMaps',
    value: function _createIndexMaps(inputShape) {
      if (this._tiledOutputRowIndicesMap && this._tiledOutputColIndicesMap) {
        return;
      }

      var inputRows = inputShape[0];
      var inputCols = inputShape[1];

      var _kernelShape2 = _slicedToArray(this.kernelShape, 3),
          nbFilter = _kernelShape2[0],
          nbRow = _kernelShape2[1],
          nbCol = _kernelShape2[2];

      var _outputPadding = _slicedToArray(this.outputPadding, 4),
          paddingRowBefore = _outputPadding[0],
          paddingRowAfter = _outputPadding[1],
          paddingColBefore = _outputPadding[2],
          paddingColAfter = _outputPadding[3];

      var indicesMapShape = [].concat(_toConsumableArray(this.outputShape), [inputRows * inputCols]);
      var indicesMapShapePadded = [this.outputShape[0] + paddingRowBefore + paddingRowAfter, this.outputShape[1] + paddingColBefore + paddingColAfter, this.outputShape[2], inputRows * inputCols];
      var outputRowIndicesMap = new _Tensor2.default([], indicesMapShape, { type: Int32Array });
      var outputColIndicesMap = new _Tensor2.default([], indicesMapShape, { type: Int32Array });
      var outputRowIndicesMapPadded = new _Tensor2.default([], indicesMapShapePadded, { type: Int32Array });
      var outputColIndicesMapPadded = new _Tensor2.default([], indicesMapShapePadded, { type: Int32Array });
      _ndarrayOps2.default.assigns(outputRowIndicesMap.tensor, -1);
      _ndarrayOps2.default.assigns(outputColIndicesMap.tensor, -1);
      _ndarrayOps2.default.assigns(outputRowIndicesMapPadded.tensor, -1);
      _ndarrayOps2.default.assigns(outputColIndicesMapPadded.tensor, -1);

      var matMulColIndicesPatch = new _Tensor2.default([], [nbRow, nbCol, nbFilter, 1], { type: Int32Array });
      for (var i = 0; i < nbRow * nbCol * nbFilter; i++) {
        matMulColIndicesPatch.tensor.data[i] = i;
      }

      for (var _i = 0; _i < inputRows; _i++) {
        for (var j = 0; j < inputCols; j++) {
          var matMulRowIndex = _i * inputCols + j;
          var iOutPos = _i * this.strides[0];
          var jOutPos = j * this.strides[1];
          _ndarrayOps2.default.assigns(outputRowIndicesMapPadded.tensor.hi(iOutPos + nbRow, jOutPos + nbCol, this.outputShape[2], matMulRowIndex + 1).lo(iOutPos, jOutPos, 0, matMulRowIndex), matMulRowIndex);
          _ndarrayOps2.default.assign(outputColIndicesMapPadded.tensor.hi(iOutPos + nbRow, jOutPos + nbCol, this.outputShape[2], matMulRowIndex + 1).lo(iOutPos, jOutPos, 0, matMulRowIndex), matMulColIndicesPatch.tensor);
        }
      }

      // remove padding
      _ndarrayOps2.default.assign(outputRowIndicesMap.tensor, outputRowIndicesMapPadded.tensor.hi(this.outputShape[0] + paddingRowBefore, this.outputShape[1] + paddingColBefore, this.outputShape[2], inputRows * inputCols).lo(paddingRowBefore, paddingColBefore, 0, 0));
      _ndarrayOps2.default.assign(outputColIndicesMap.tensor, outputColIndicesMapPadded.tensor.hi(this.outputShape[0] + paddingRowBefore, this.outputShape[1] + paddingColBefore, this.outputShape[2], inputRows * inputCols).lo(paddingRowBefore, paddingColBefore, 0, 0));
      // combine first two dimensions
      var tiledIndicesMapShape = [this.outputShape[0] * this.outputShape[1], this.outputShape[2], inputRows * inputCols];
      this._tiledOutputRowIndicesMap = new _Tensor2.default([], tiledIndicesMapShape, { type: Int32Array });
      this._tiledOutputColIndicesMap = new _Tensor2.default([], tiledIndicesMapShape, { type: Int32Array });
      var channelData = new _Tensor2.default([], [this.outputShape[2], inputRows * inputCols], { type: Int32Array });
      for (var _i2 = 0; _i2 < this.outputShape[0]; _i2++) {
        for (var _j = 0; _j < this.outputShape[1]; _j++) {
          _ndarrayOps2.default.assign(channelData.tensor, outputRowIndicesMap.tensor.pick(_i2, _j, null, null));
          _ndarrayOps2.default.assign(this._tiledOutputRowIndicesMap.tensor.pick(_i2 * this.outputShape[1] + _j, null, null), channelData.tensor);
          _ndarrayOps2.default.assign(channelData.tensor, outputColIndicesMap.tensor.pick(_i2, _j, null, null));
          _ndarrayOps2.default.assign(this._tiledOutputColIndicesMap.tensor.pick(_i2 * this.outputShape[1] + _j, null, null), channelData.tensor);
        }
      }

      if (this.gpu) {
        this._tiledOutputRowIndicesMap.createGLTexture('2darray', 'int');
        this._tiledOutputColIndicesMap.createGLTexture('2darray', 'int');
      }
    }

    /**
     * CPU call
     */

  }, {
    key: '_call_cpu',
    value: function _call_cpu(x) {
      this.inputShape = x.tensor.shape;
      this._calcOutputShape(this.inputShape);
      this._im2col(x);

      var inputRows = x.tensor.shape[0];
      var inputCols = x.tensor.shape[1];

      var _kernelShape3 = _slicedToArray(this.kernelShape, 3),
          nbFilter = _kernelShape3[0],
          nbRow = _kernelShape3[1],
          nbCol = _kernelShape3[2];

      var matMul = new _Tensor2.default([], [inputRows * inputCols, nbRow * nbCol * nbFilter]);

      (0, _ndarrayGemm2.default)(matMul.tensor, this._imColsMat.tensor, this._wRowsMat.tensor, 1, 1);

      // add padding which we will take away later

      var _outputPadding2 = _slicedToArray(this.outputPadding, 4),
          paddingRowBefore = _outputPadding2[0],
          paddingRowAfter = _outputPadding2[1],
          paddingColBefore = _outputPadding2[2],
          paddingColAfter = _outputPadding2[3];

      this.output = new _Tensor2.default([], this.outputShape);
      var outputPadded = new _Tensor2.default([], [this.outputShape[0] + paddingRowBefore + paddingRowAfter, this.outputShape[1] + paddingColBefore + paddingColAfter, this.outputShape[2]]);

      var patchShape = [nbRow, nbCol, nbFilter];
      var patch = new _Tensor2.default([], patchShape);
      var patchRaveled = new _Tensor2.default([], [nbRow * nbCol * nbFilter]);
      var index = 0;
      for (var i = 0; i < inputRows; i++) {
        for (var j = 0; j < inputCols; j++) {
          _ndarrayOps2.default.assign(patchRaveled.tensor, matMul.tensor.pick(index, null));
          patch.replaceTensorData(patchRaveled.tensor.data);
          var iOutPos = i * this.strides[0];
          var jOutPos = j * this.strides[1];
          _ndarrayOps2.default.addeq(outputPadded.tensor.hi(iOutPos + nbRow, jOutPos + nbCol, this.outputShape[2]).lo(iOutPos, jOutPos, 0), patch.tensor);
          index += 1;
        }
      }

      // remove padding
      _ndarrayOps2.default.assign(this.output.tensor, outputPadded.tensor.hi(this.outputShape[0] + paddingRowBefore, this.outputShape[1] + paddingColBefore, this.outputShape[2]).lo(paddingRowBefore, paddingColBefore, 0));

      // bias
      if (this.use_bias) {
        for (var n = 0; n < nbFilter; n++) {
          _ndarrayOps2.default.addseq(this.output.tensor.pick(null, null, n), this.weights['bias'].tensor.get(n));
        }
      }

      this.activationFunc(this.output);

      // convert back to channels_first ordering if necessary
      if (this.dataFormat === 'channels_first') {
        this.output.tensor = this.output.tensor.transpose(2, 0, 1);
      }
    }

    /**
     * GPU call
     */

  }, {
    key: '_call_gpu',
    value: function _call_gpu(x) {
      if (x.glTextureIsTiled) {
        this.inputShape = x.untiledShape;
        this._calcOutputShape(this.inputShape);
      } else {
        this.inputShape = x.tensor.shape;
        this._calcOutputShape(this.inputShape);
        this._im2col(x);
        x.glTexture = this._imColsMat.glTexture;
        x.glTextureShape = this._imColsMat.glTextureShape;
      }

      // create output textures if doesn't already exist
      if (!this.output_matmul) {
        var outputTextureShape = [x.glTextureShape[0], this.weights['kernel'].glTextureShape[1]];
        this.output_matmul = new _Tensor2.default([], outputTextureShape);
        this.output_matmul.createGLTexture();
      }
      if (!this.output_preactiv) {
        var _outputTextureShape = [this.outputShape[0] * this.outputShape[1], this.outputShape[2]];
        this.output_preactiv = new _Tensor2.default([], _outputTextureShape);
        this.output_preactiv.createGLTexture();
      }
      if (!this.output) {
        var _outputTextureShape2 = [this.outputShape[0] * this.outputShape[1], this.outputShape[2]];
        this.output = new _Tensor2.default([], _outputTextureShape2);
        this.output.createGLTexture();
        this.output.glTextureIsTiled = true;
        this.output.untiledShape = this.outputShape;
      }

      // Matrix Multiply with kernel
      _WebGL.webgl2.selectProgram(this.matMulProgram);
      _WebGL.webgl2.bindOutputTexture(this.output_matmul.glTexture, this.output_matmul.glTextureShape);
      var textures = [x.glTexture, this.weights['kernel'].glTexture];
      var textureTypes = ['2d', '2d'];
      var textureNames = ['A', 'B'];
      _WebGL.webgl2.bindInputTextures(this.matMulProgram, textures, textureTypes, textureNames);
      var uniforms = [0, x.glTextureShape[0]].concat(_toConsumableArray(this.weights['kernel'].glTextureShape));
      var uniformTypes = ['bool', 'int', 'int', 'int'];
      var uniformNames = ['addC', 'M', 'K', 'N'];
      _WebGL.webgl2.bindUniforms(this.matMulProgram, uniforms, uniformTypes, uniformNames);
      _WebGL.webgl2.runProgram();

      // Tranposed Convolution
      this._createIndexMaps(this.inputShape);
      var test = new _Tensor2.default([], [this.outputShape[0] * this.outputShape[1], this.outputShape[2]]);
      _ndarrayOps2.default.assign(test.tensor, this._tiledOutputRowIndicesMap.tensor.pick(null, null, 0));
      _WebGL.webgl2.selectProgram(this.convTransposeProgram);
      _WebGL.webgl2.bindOutputTexture(this.output_preactiv.glTexture, this.output_preactiv.glTextureShape);
      textures = [this.output_matmul.glTexture, this._tiledOutputRowIndicesMap.glTexture, this._tiledOutputColIndicesMap.glTexture];
      textureTypes = ['2d', '2darray', '2darray'];
      textureNames = ['matMulOutput', 'rowIndicesMap', 'colIndicesMap'];
      if (this.use_bias) {
        textures.push(this.weights['bias'].glTexture);
        textureTypes.push('2d');
        textureNames.push('bias');
      }
      _WebGL.webgl2.bindInputTextures(this.convTransposeProgram, textures, textureTypes, textureNames);
      uniforms = [this.use_bias ? 1 : 0, this.outputShape[0] * this.outputShape[1], this.outputShape[2], this.inputShape[0] * this.inputShape[1]];
      uniformTypes = ['bool', 'int', 'int', 'int'];
      uniformNames = ['use_bias', 'rows', 'cols', 'summationLength'];
      _WebGL.webgl2.bindUniforms(this.convTransposeProgram, uniforms, uniformTypes, uniformNames);
      _WebGL.webgl2.runProgram();

      // Activation
      _WebGL.webgl2.selectProgram(this.activationProgram);
      _WebGL.webgl2.bindOutputTexture(this.output.glTexture, this.output.glTextureShape);
      textures = [this.output_preactiv.glTexture];
      textureTypes = ['2d'];
      textureNames = ['x'];
      _WebGL.webgl2.bindInputTextures(this.activationProgram, textures, textureTypes, textureNames);
      _WebGL.webgl2.runProgram();

      // GPU -> CPU data transfer
      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
        this.output.reshapeTensorFromTiled();

        // convert back to channels_first ordering if necessary
        if (this.dataFormat === 'channels_first') {
          this.output.tensor = this.output.tensor.transpose(2, 0, 1);
        }
      }
    }
  }]);

  return Conv2DTranspose;
}(_Layer3.default);

exports.default = Conv2DTranspose;