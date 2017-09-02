'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _WebGL = require('./WebGL2');

var _ndarray = require('ndarray');

var _ndarray2 = _interopRequireDefault(_ndarray);

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _ndarraySqueeze = require('ndarray-squeeze');

var _ndarraySqueeze2 = _interopRequireDefault(_ndarraySqueeze);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var checkShape = function checkShape(data, shape) {
  if (data.length && shape.length && data.length !== shape.reduce(function (a, b) {
    return a * b;
  }, 1)) {
    throw new Error('Specified shape incompatible with data.');
  }
};

/**
 * Tensor class
 */

var Tensor = function () {
  /**
   * Creates a tensor
   * @param {(TypedArray|Array)} data
   * @param {Array} shape
   * @param {Object} [options]
   */
  function Tensor(data, shape) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, Tensor);

    this._type = options.type || Float32Array;

    if (data && data.length && (data instanceof this._type || data instanceof Array)) {
      checkShape(data, shape);
      this.tensor = (0, _ndarray2.default)(data, shape);
      this.tensor = (0, _ndarray2.default)(new this._type(data), shape);
    } else if (!data.length && shape.length) {
      // if shape present but data not provided, initialize with 0s
      this.tensor = (0, _ndarray2.default)(new this._type(shape.reduce(function (a, b) {
        return a * b;
      }, 1)), shape);
    } else {
      this.tensor = (0, _ndarray2.default)(new this._type([]), []);
    }
  }

  /**
   * Replaces data in the underlying ndarray.
   */


  _createClass(Tensor, [{
    key: 'replaceTensorData',
    value: function replaceTensorData(data) {
      if (data && data.length && data instanceof this._type) {
        this.tensor.data = data;
      } else if (data && data.length && data instanceof Array) {
        this.tensor.data = new this._type(data);
      } else {
        throw new Error('[Tensor] invalid input for replaceTensorData method.');
      }
    }

    /**
     * Creates WebGL2 texture
     * Without args, defaults to gl.TEXTURE_2D and gl.R32F
     */

  }, {
    key: 'createGLTexture',
    value: function createGLTexture() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '2d';
      var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'float';

      var shape = [];
      if (this.tensor.shape.length === 1) {
        shape = [1, this.tensor.shape[0]];
      } else if (this.tensor.shape.length === 2) {
        shape = this.tensor.shape;
      } else if (this.tensor.shape.length === 3 && ['2darray', '3d'].includes(type)) {
        shape = this.tensor.shape;
      } else {
        throw new Error('[Tensor] cannot create WebGL2 texture.');
      }

      var gl = _WebGL.webgl2.context;

      var targetMap = {
        '2d': gl.TEXTURE_2D,
        '2darray': gl.TEXTURE_2D_ARRAY,
        '3d': gl.TEXTURE_3D
      };

      var internalFormatMap = {
        float: gl.R32F,
        int: gl.R32I
      };

      var formatMap = {
        float: gl.RED,
        int: gl.RED_INTEGER
      };

      var typeMap = {
        float: gl.FLOAT,
        int: gl.INT
      };

      this.glTexture = gl.createTexture();
      gl.bindTexture(targetMap[type], this.glTexture);
      if (type === '2d') {
        var data = this.tensor.data;

        gl.texImage2D(targetMap[type], 0, internalFormatMap[format], shape[1], shape[0], 0, formatMap[format], typeMap[format], data);
      } else if (type === '2darray' || type === '3d') {
        // must shuffle data layout for webgl
        // data for TEXTURE_2D_ARRAY or TEXTURE_3D laid out sequentially per-slice
        var _data = new this._type(this.tensor.data.length);
        var slice = (0, _ndarray2.default)(new this._type(shape[0] * shape[1]), [shape[0], shape[1]]);
        var offset = 0;
        for (var i = 0; i < shape[2]; i++) {
          _ndarrayOps2.default.assign(slice, this.tensor.pick(null, null, i));
          _data.set(slice.data, offset);
          offset += shape[0] * shape[1];
        }

        gl.texImage3D(targetMap[type], 0, internalFormatMap[format], shape[1], shape[0], shape[2], 0, formatMap[format], typeMap[format], _data);
      }

      this.glTextureShape = shape;

      // clamp to edge
      gl.texParameteri(targetMap[type], gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(targetMap[type], gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      // no interpolation
      gl.texParameteri(targetMap[type], gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(targetMap[type], gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }
  }, {
    key: 'deleteGLTexture',
    value: function deleteGLTexture() {
      if (this.glTexture) {
        var gl = _WebGL.webgl2.context;
        gl.deleteTexture(this.glTexture);
        delete this.glTexture;
      }
    }

    /**
     * Transfer data from webgl texture on GPU to ndarray on CPU
     */

  }, {
    key: 'transferFromGLTexture',
    value: function transferFromGLTexture() {
      this.tensor.data = _WebGL.webgl2.readData(this.glTextureShape);
      if (!this.glTextureIsTiled && this.glTextureShape[0] === 1) {
        // collapse to 1D
        this.tensor = (0, _ndarraySqueeze2.default)(this.tensor);
      }
    }

    /**
     * Reshapes data into tiled form.
     * @param {Number} axis
     */

  }, {
    key: 'reshapeTensorToTiled',
    value: function reshapeTensorToTiled() {
      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

      if (axis < 0) {
        axis = this.tensor.shape.length + axis;
      }

      var normAxisLength = this.tensor.shape[axis];
      var otherAxes = [].concat(_toConsumableArray(this.tensor.shape.slice(0, axis)), _toConsumableArray(this.tensor.shape.slice(axis + 1)));
      var otherAxesSize = otherAxes.reduce(function (a, b) {
        return a * b;
      }, 1);
      var tiled = (0, _ndarray2.default)(new this._type(otherAxesSize * normAxisLength), [otherAxesSize, normAxisLength]);
      var otherAxesData = (0, _ndarray2.default)(new this._type(otherAxesSize), otherAxes);
      var otherAxesDataRaveled = (0, _ndarray2.default)(new this._type(otherAxesSize), [otherAxesSize]);
      var axisSlices = Array(this.tensor.shape.length).fill(null);
      for (var n = 0; n < normAxisLength; n++) {
        var _tensor;

        axisSlices[axis] = n;
        _ndarrayOps2.default.assign(otherAxesData, (_tensor = this.tensor).pick.apply(_tensor, _toConsumableArray(axisSlices)));
        otherAxesDataRaveled.data = otherAxesData.data;
        _ndarrayOps2.default.assign(tiled.pick(null, n), otherAxesDataRaveled);
      }

      this.untiledShape = this.tensor.shape;
      this.tensor = tiled;
      this.glTextureIsTiled = true;
    }

    /**
     * Reshapes tiled data into untiled form.
     * Called at the end when data is read back from GPU (which is in tiled 2D format from texture)
     * @param {Number} axis
     */

  }, {
    key: 'reshapeTensorFromTiled',
    value: function reshapeTensorFromTiled() {
      var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;

      if (!this.glTextureIsTiled) {
        throw new Error('Tensor is not in tiled format.');
      }
      if (!this.untiledShape) {
        throw new Error('Tensor does not contain untiledShape.');
      }

      if (axis < 0) {
        axis = this.untiledShape.length + axis;
      }

      // second axis is the channel, or common, axis
      var channelDataSize = this.tensor.shape[0];
      var channels = this.tensor.shape[1];

      var reshaped = (0, _ndarray2.default)(new this._type(this.untiledShape.reduce(function (a, b) {
        return a * b;
      }, 1)), this.untiledShape);
      var channelDataRaveled = (0, _ndarray2.default)(new this._type(channelDataSize), [channelDataSize]);
      var untiledChannelShape = [].concat(_toConsumableArray(this.untiledShape.slice(0, axis)), _toConsumableArray(this.untiledShape.slice(axis + 1)));
      var untiledChannel = (0, _ndarray2.default)(new this._type(untiledChannelShape.reduce(function (a, b) {
        return a * b;
      }, 1)), untiledChannelShape);
      var axisSlices = Array(this.untiledShape.length).fill(null);
      for (var n = 0; n < channels; n++) {
        _ndarrayOps2.default.assign(channelDataRaveled, this.tensor.pick(null, n));
        untiledChannel.data = channelDataRaveled.data;
        axisSlices[axis] = n;
        _ndarrayOps2.default.assign(reshaped.pick.apply(reshaped, _toConsumableArray(axisSlices)), untiledChannel);
      }

      this.tensor = reshaped;
    }
  }]);

  return Tensor;
}();

exports.default = Tensor;