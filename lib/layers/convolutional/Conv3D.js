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
 * Conv3D layer class
 */
var Conv3D = function (_Layer) {
  _inherits(Conv3D, _Layer);

  /**
   * Creates a Conv3D layer
   * @param {Number} attrs.filters - Number of convolution filters to use.
   * @param {Array<Number>|Number} attrs.kernel_size - Size of the convolution kernel.
   * @param {Object} [attrs] - layer attributes
   */
  function Conv3D() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Conv3D);

    var _this = _possibleConstructorReturn(this, (Conv3D.__proto__ || Object.getPrototypeOf(Conv3D)).call(this, attrs));

    _this.layerClass = 'Conv3D';

    var _attrs$filters = attrs.filters,
        filters = _attrs$filters === undefined ? 1 : _attrs$filters,
        _attrs$kernel_size = attrs.kernel_size,
        kernel_size = _attrs$kernel_size === undefined ? [1, 1, 1] : _attrs$kernel_size,
        _attrs$strides = attrs.strides,
        strides = _attrs$strides === undefined ? [1, 1, 1] : _attrs$strides,
        _attrs$padding = attrs.padding,
        padding = _attrs$padding === undefined ? 'valid' : _attrs$padding,
        _attrs$data_format = attrs.data_format,
        data_format = _attrs$data_format === undefined ? 'channels_last' : _attrs$data_format,
        _attrs$dilation_rate = attrs.dilation_rate,
        dilation_rate = _attrs$dilation_rate === undefined ? [1, 1, 1] : _attrs$dilation_rate,
        _attrs$activation = attrs.activation,
        activation = _attrs$activation === undefined ? 'linear' : _attrs$activation,
        _attrs$use_bias = attrs.use_bias,
        use_bias = _attrs$use_bias === undefined ? true : _attrs$use_bias;


    if (Array.isArray(kernel_size)) {
      _this.kernelShape = [filters].concat(_toConsumableArray(kernel_size));
    } else {
      _this.kernelShape = [filters, kernel_size, kernel_size, kernel_size];
    }

    if (Array.isArray(strides)) {
      _this.strides = strides;
    } else {
      _this.strides = [strides, strides, strides];
    }

    if (padding === 'valid' || padding === 'same') {
      _this.padding = padding;
    } else {
      throw new Error(`${_this.name} [Conv3D layer] Invalid padding.`);
    }

    if (data_format === 'channels_last' || data_format === 'channels_first') {
      _this.dataFormat = data_format;
    } else {
      throw new Error(`${_this.name} [Conv3D layer] Only channels_last and channels_first data formats are allowed.`);
    }

    if (Array.isArray(dilation_rate)) {
      _this.dilationRate = dilation_rate;
    } else {
      _this.dilationRate = [dilation_rate, dilation_rate, dilation_rate];
    }
    if ((_this.dilationRate[0] !== 1 || _this.dilationRate[1] !== 1 || _this.dilationRate[2] !== 1) && (_this.strides[0] !== 1 || _this.strides[1] !== 1 || _this.strides[2] !== 1)) {
      // Currently, specifying any dilation_rate value != 1 is incompatible with specifying any stride value != 1
      // https://keras.io/layers/convolutional/#conv3d
      throw new Error(`${_this.name} [Conv3D layer] Incompatible combination of dilation_rate with strides.`);
    }

    _this.activation = activation;
    _this.activationFunc = activations[activation];

    _this.use_bias = use_bias;

    // Layer weights specification
    _this.params = _this.use_bias ? ['kernel', 'bias'] : ['kernel'];

    // GPU setup
    if (_this.gpu) {
      _this.matMulProgram = _WebGL.webgl2.compileProgram(require('../../matMul.webgl2.glsl'));
      _this.activationProgram = _WebGL.webgl2.compileProgram(require(`../../activations/${_this.activation}.webgl2.glsl`));
    }
    return _this;
  }

  /**
   * Method for setting layer weights. Extends `super` method.
   * W weight tensor is converted to `channels_last` mode if in `channels_first` mode.
   * In `channels_last` mode, W weight tensor has shape [kernelDim1, kernelDim2, kernelDim3, inputChannels, nbFilter]
   * In `channels_first` mode, W weight tensor has shape [nbFilter, inputChannels, kernelDim1, kernelDim2, kernelDim3]
   * @param {Tensor[]} weightsArr - array of weights which are instances of Tensor
   */


  _createClass(Conv3D, [{
    key: 'setWeights',
    value: function setWeights(weightsArr) {
      if (this.dataFormat === 'channels_first') {
        weightsArr[0].tensor = weightsArr[0].tensor.transpose(2, 3, 4, 1, 0);
      }
      _get(Conv3D.prototype.__proto__ || Object.getPrototypeOf(Conv3D.prototype), 'setWeights', this).call(this, weightsArr, false);

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
     * @param {number[]} inputShape
     */

  }, {
    key: '_calcOutputShape',
    value: function _calcOutputShape(inputShape) {
      var inputDim1 = inputShape[0];
      var inputDim2 = inputShape[1];
      var inputDim3 = inputShape[2];

      var _kernelShape = _slicedToArray(this.kernelShape, 4),
          nbFilter = _kernelShape[0],
          kernelDim1 = _kernelShape[1],
          kernelDim2 = _kernelShape[2],
          kernelDim3 = _kernelShape[3];

      // effective shape after filter dilation


      var kernelDim1Dilated = kernelDim1 + (kernelDim1 - 1) * (this.dilationRate[0] - 1);
      var kernelDim2Dilated = kernelDim2 + (kernelDim2 - 1) * (this.dilationRate[1] - 1);
      var kernelDim3Dilated = kernelDim3 + (kernelDim3 - 1) * (this.dilationRate[2] - 1);

      var outputDim1 = this.padding === 'same' ? Math.floor((inputDim1 + this.strides[0] - 1) / this.strides[0]) : Math.floor((inputDim1 - kernelDim1Dilated + this.strides[0]) / this.strides[0]);
      var outputDim2 = this.padding === 'same' ? Math.floor((inputDim2 + this.strides[1] - 1) / this.strides[1]) : Math.floor((inputDim2 - kernelDim2Dilated + this.strides[1]) / this.strides[1]);
      var outputDim3 = this.padding === 'same' ? Math.floor((inputDim3 + this.strides[2] - 1) / this.strides[2]) : Math.floor((inputDim3 - kernelDim3Dilated + this.strides[2]) / this.strides[2]);
      var outputChannels = nbFilter;

      var paddingDim1 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim1 - 1) * this.strides[0] + kernelDim1Dilated - inputDim1)) : 0;
      var paddingDim2 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim2 - 1) * this.strides[1] + kernelDim2Dilated - inputDim2)) : 0;
      var paddingDim3 = this.padding === 'same' ? Math.max(0, Math.floor((outputDim3 - 1) * this.strides[2] + kernelDim3Dilated - inputDim3)) : 0;
      var paddingDim1Before = Math.floor(paddingDim1 / 2);
      var paddingDim1After = paddingDim1 - paddingDim1Before;
      var paddingDim2Before = Math.floor(paddingDim2 / 2);
      var paddingDim2After = paddingDim2 - paddingDim2Before;
      var paddingDim3Before = Math.floor(paddingDim3 / 2);
      var paddingDim3After = paddingDim3 - paddingDim3Before;

      this.outputShape = [outputDim1, outputDim2, outputDim3, outputChannels];
      this.inputPadding = [paddingDim1Before, paddingDim1After, paddingDim2Before, paddingDim2After, paddingDim3Before, paddingDim3After];
    }

    /**
     * Pad input tensor if necessary, for padding='same'
     * @param {Tensor} x
     * @param {number} [padValue]
     * @returns {Tensor}
     */

  }, {
    key: '_padInput',
    value: function _padInput(x) {
      var padValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (this.padding === 'same') {
        var _x$tensor$shape = _slicedToArray(x.tensor.shape, 4),
            inputDim1 = _x$tensor$shape[0],
            inputDim2 = _x$tensor$shape[1],
            inputDim3 = _x$tensor$shape[2],
            inputChannels = _x$tensor$shape[3];

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
        _ndarrayOps2.default.assign(_x.tensor.hi(inputDim1 + paddingDim1Before, inputDim2 + paddingDim2Before, inputDim3 + paddingDim3Before, inputChannels).lo(paddingDim1Before, paddingDim2Before, paddingDim3Before, 0), x.tensor);
        x.tensor = _x.tensor;
      }
      return x;
    }

    /**
     * Convert input volume to column matrix
     * @param {Tensor} x
     * @returns {Tensor} x
     */

  }, {
    key: '_vol2col',
    value: function _vol2col(x) {
      var _x$tensor$shape2 = _slicedToArray(x.tensor.shape, 4),
          inputDim1 = _x$tensor$shape2[0],
          inputDim2 = _x$tensor$shape2[1],
          inputDim3 = _x$tensor$shape2[2],
          inputChannels = _x$tensor$shape2[3];

      var kernelDim1 = this.kernelShape[1];
      var kernelDim2 = this.kernelShape[2];
      var kernelDim3 = this.kernelShape[3];
      var outputDim1 = this.outputShape[0];
      var outputDim2 = this.outputShape[1];
      var outputDim3 = this.outputShape[2];
      var nbPatches = outputDim1 * outputDim2 * outputDim3;
      var patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels;

      // effective shape after filter dilation
      var kernelDim1Dilated = kernelDim1 + (kernelDim1 - 1) * (this.dilationRate[0] - 1);
      var kernelDim2Dilated = kernelDim2 + (kernelDim2 - 1) * (this.dilationRate[1] - 1);
      var kernelDim3Dilated = kernelDim3 + (kernelDim3 - 1) * (this.dilationRate[2] - 1);

      if (!this._volColsMat) {
        this._volColsMat = new _Tensor2.default([], [nbPatches, patchLen]);
      }

      if (kernelDim1Dilated === 1 && kernelDim2Dilated === 1 && kernelDim3Dilated === 1 && this.strides[0] === 1 && this.strides[1] === 1 && this.strides[2] === 1) {
        this._volColsMat.replaceTensorData(x.tensor.data);
        if (this.gpu) {
          this._volColsMat.createGLTexture();
        }
        return this._volColsMat;
      }

      var patch = new _Tensor2.default([], [kernelDim1, kernelDim2, kernelDim3, inputChannels]);
      var offset = 0;
      for (var i = 0, limit = inputDim1 - kernelDim1Dilated; i <= limit; i += this.strides[0]) {
        for (var j = 0, _limit = inputDim2 - kernelDim2Dilated; j <= _limit; j += this.strides[1]) {
          for (var k = 0, _limit2 = inputDim3 - kernelDim3Dilated; k <= _limit2; k += this.strides[2]) {
            _ndarrayOps2.default.assign(patch.tensor, x.tensor.hi(i + kernelDim1Dilated, j + kernelDim2Dilated, k + kernelDim3Dilated, inputChannels).lo(i, j, k, 0).step(this.dilationRate[0], this.dilationRate[1], this.dilationRate[2], 1));
            this._volColsMat.tensor.data.set(patch.tensor.data, offset);
            offset += patchLen;
          }
        }
      }
      if (this.gpu) {
        this._volColsMat.createGLTexture();
      }
      return this._volColsMat;
    }

    /**
     * Convert filter weights to row matrix
     * @returns {Tensor}
     */

  }, {
    key: '_w2row',
    value: function _w2row() {
      var inputChannels = this.weights['kernel'].tensor.shape[3];

      var _kernelShape2 = _slicedToArray(this.kernelShape, 4),
          nbFilter = _kernelShape2[0],
          kernelDim1 = _kernelShape2[1],
          kernelDim2 = _kernelShape2[2],
          kernelDim3 = _kernelShape2[3];

      var patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels;

      this._wRowsMat = new _Tensor2.default([], [patchLen, nbFilter]);

      var patch = new _Tensor2.default([], [kernelDim1, kernelDim2, kernelDim3, inputChannels]);
      var patchRaveled = new _Tensor2.default([], [patchLen]);
      for (var n = 0; n < nbFilter; n++) {
        _ndarrayOps2.default.assign(patch.tensor, this.weights['kernel'].tensor.pick(null, null, null, null, n));
        patchRaveled.replaceTensorData(patch.tensor.data);
        _ndarrayOps2.default.assign(this._wRowsMat.tensor.pick(null, n), patchRaveled.tensor);
      }

      return this._wRowsMat;
    }

    /**
     * Creates a index mapping from the 2D-tiled input tensor with associated
     * 3D tensor shape to the representation required prior to the matrix multiply.
     * This allows us to work directly on the 2D tiled tensor representations rather
     * than needing to reshape to the 3D reprentation and calling im2col.
     * @param {number[]} inputShape
     */

  }, {
    key: '_tiledIndexMapping',
    value: function _tiledIndexMapping(inputShape) {
      if (this._tiledIndexMappingRow && this._tiledIndexMappingCol) {
        return;
      }

      var _inputShape = _slicedToArray(inputShape, 4),
          inputDim1 = _inputShape[0],
          inputDim2 = _inputShape[1],
          inputDim3 = _inputShape[2],
          inputChannels = _inputShape[3];

      var indicesRow = new _Tensor2.default([], inputShape);
      var indicesCol = new _Tensor2.default([], inputShape);
      for (var i = 0; i < inputDim1; i++) {
        for (var j = 0; j < inputDim2; j++) {
          for (var k = 0; k < inputDim3; k++) {
            _ndarrayOps2.default.assigns(indicesRow.tensor.pick(i, j, k, null), i * inputDim2 * inputDim3 + j * inputDim3 + k);
          }
        }
      }
      for (var c = 0; c < inputChannels; c++) {
        _ndarrayOps2.default.assigns(indicesCol.tensor.pick(null, null, null, c), c);
      }

      // padding for border mode 'same'
      if (this.padding === 'same') {
        var _inputPadding2 = _slicedToArray(this.inputPadding, 6),
            paddingDim1Before = _inputPadding2[0],
            paddingDim1After = _inputPadding2[1],
            paddingDim2Before = _inputPadding2[2],
            paddingDim2After = _inputPadding2[3],
            paddingDim3Before = _inputPadding2[4],
            paddingDim3After = _inputPadding2[5];

        var newDim1 = inputDim1 + paddingDim1Before + paddingDim1After;
        var newDim2 = inputDim2 + paddingDim2Before + paddingDim2After;
        var newDim3 = inputDim3 + paddingDim3Before + paddingDim3After;
        var padValue = -1;
        this._padInput(indicesRow, padValue);
        this._padInput(indicesCol, padValue);
      }

      var kernelDim1 = this.kernelShape[1];
      var kernelDim2 = this.kernelShape[2];
      var kernelDim3 = this.kernelShape[3];
      var outputDim1 = this.outputShape[0];
      var outputDim2 = this.outputShape[1];
      var outputDim3 = this.outputShape[2];
      var nbPatches = outputDim1 * outputDim2 * outputDim3;
      var patchLen = kernelDim1 * kernelDim2 * kernelDim3 * inputChannels;

      this._tiledIndexMappingRow = new _Tensor2.default([], [nbPatches, patchLen]);
      this._tiledIndexMappingCol = new _Tensor2.default([], [nbPatches, patchLen]);

      var patchRow = new _Tensor2.default([], [kernelDim1, kernelDim2, kernelDim3, inputChannels]);
      var patchCol = new _Tensor2.default([], [kernelDim1, kernelDim2, kernelDim3, inputChannels]);
      var offset = 0;
      for (var _i = 0, limit = inputDim1 - kernelDim1; _i <= limit; _i += this.strides[0]) {
        for (var _j = 0, _limit3 = inputDim2 - kernelDim2; _j <= _limit3; _j += this.strides[1]) {
          for (var _k = 0, _limit4 = inputDim3 - kernelDim3; _k <= _limit4; _k += this.strides[2]) {
            _ndarrayOps2.default.assign(patchRow.tensor, indicesRow.tensor.hi(_i + kernelDim1, _j + kernelDim2, _k + kernelDim3, inputChannels).lo(_i, _j, _k, 0));
            _ndarrayOps2.default.assign(patchCol.tensor, indicesCol.tensor.hi(_i + kernelDim1, _j + kernelDim2, _k + kernelDim3, inputChannels).lo(_i, _j, _k, 0));
            this._tiledIndexMappingRow.tensor.data.set(patchRow.tensor.data, offset);
            this._tiledIndexMappingCol.tensor.data.set(patchCol.tensor.data, offset);
            offset += patchLen;
          }
        }
      }

      if (this.gpu) {
        this._tiledIndexMappingRow.createGLTexture();
        this._tiledIndexMappingCol.createGLTexture();
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
      this._padInput(x);
      this._vol2col(x);

      var nbFilter = this.kernelShape[0];
      var outputDim1 = this.outputShape[0];
      var outputDim2 = this.outputShape[1];
      var outputDim3 = this.outputShape[2];
      var nbPatches = outputDim1 * outputDim2 * outputDim3;
      var matMul = new _Tensor2.default([], [nbPatches, nbFilter]);

      if (this.use_bias) {
        for (var n = 0; n < nbFilter; n++) {
          _ndarrayOps2.default.assigns(matMul.tensor.pick(null, n), this.weights['bias'].tensor.get(n));
        }
      }
      (0, _ndarrayGemm2.default)(matMul.tensor, this._volColsMat.tensor, this._wRowsMat.tensor, 1, 1);

      this.output = new _Tensor2.default([], this.outputShape);

      var outputChannelRaveled = new _Tensor2.default([], [outputDim1 * outputDim2 * outputDim3]);
      var outputChannel = new _Tensor2.default([], [outputDim1, outputDim2, outputDim3]);
      for (var _n = 0; _n < nbFilter; _n++) {
        _ndarrayOps2.default.assign(outputChannelRaveled.tensor, matMul.tensor.pick(null, _n));
        outputChannel.replaceTensorData(outputChannelRaveled.tensor.data);
        _ndarrayOps2.default.assign(this.output.tensor.pick(null, null, null, _n), outputChannel.tensor);
      }

      this.activationFunc(this.output);

      // convert back to channels_first ordering if necessary
      if (this.dataFormat === 'channels_first') {
        this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2);
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
        this._tiledIndexMapping(this.inputShape);
      } else {
        this.inputShape = x.tensor.shape;
        this._calcOutputShape(this.inputShape);
        this._padInput(x);
        this._vol2col(x);
        x.glTexture = this._volColsMat.glTexture;
        x.glTextureShape = this._volColsMat.glTextureShape;
      }

      // create output textures if doesn't already exist
      if (!this.output_preactiv) {
        var outputTextureShape = [x.glTextureShape[0], this.weights['kernel'].glTextureShape[1]];
        this.output_preactiv = new _Tensor2.default([], outputTextureShape);
        this.output_preactiv.createGLTexture();
      }
      if (!this.output) {
        var _outputTextureShape = [x.glTextureShape[0], this.weights['kernel'].glTextureShape[1]];
        this.output = new _Tensor2.default([], _outputTextureShape);
        this.output.createGLTexture();
        this.output.glTextureIsTiled = true;
        this.output.untiledShape = this.outputShape;
      }

      // Matrix Multiply
      _WebGL.webgl2.selectProgram(this.matMulProgram);
      _WebGL.webgl2.bindOutputTexture(this.output_preactiv.glTexture, this.output_preactiv.glTextureShape);
      var textures = [x.glTexture, this.weights['kernel'].glTexture];
      var textureTypes = ['2d', '2d'];
      var textureNames = ['A', 'B'];
      if (this.use_bias) {
        textures.push(this.weights['bias'].glTexture);
        textureTypes.push('2d');
        textureNames.push('C');
      }
      _WebGL.webgl2.bindInputTextures(this.matMulProgram, textures, textureTypes, textureNames);
      var uniforms = [this.use_bias ? 1 : 0, x.glTextureShape[0]].concat(_toConsumableArray(this.weights['kernel'].glTextureShape));
      var uniformTypes = ['bool', 'int', 'int', 'int'];
      var uniformNames = ['addC', 'M', 'K', 'N'];
      _WebGL.webgl2.bindUniforms(this.matMulProgram, uniforms, uniformTypes, uniformNames);
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
          this.output.tensor = this.output.tensor.transpose(3, 0, 1, 2);
        }
      }
    }
  }]);

  return Conv3D;
}(_Layer3.default);

exports.default = Conv3D;