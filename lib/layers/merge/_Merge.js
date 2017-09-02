'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _WebGL = require('../../WebGL2');

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * _Merge layer class
 */
var _Merge = function (_Layer) {
  _inherits(_Merge, _Layer);

  /**
   * Creates a _Merge layer
   * @param {Object} [attrs] - layer attributes
   */
  function _Merge() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, _Merge);

    var _this = _possibleConstructorReturn(this, (_Merge.__proto__ || Object.getPrototypeOf(_Merge)).call(this, attrs));

    _this.layerClass = '_Merge';

    // GPU setup
    if (_this.gpu) {
      _this.copyTextureProgram = _WebGL.webgl2.compileProgram(require('../../copyTexture.webgl2.glsl'));
    }
    return _this;
  }

  /**
   * Layer computational logic
   *
   * @param {Tensor[]} inputs
   * @returns
   */


  _createClass(_Merge, [{
    key: 'call',
    value: function call(inputs) {
      if (this.gpu) {
        inputs.forEach(function (input) {
          if (!input.glTexture) {
            input.createGLTexture();
          }
        });
        this._call_gpu(inputs);
      } else {
        var valid = this._validateInputs(inputs);
        if (!valid) {
          throw new Error(`${this.name} [${this.layerClass} layer] Invalid inputs to call method.`);
        }
        this._call_cpu(inputs);
      }
      return this.output;
    }

    /**
     * Internal method for validating inputs
     * @param {Tensor[]} inputs
     * @returns {Boolean} valid
     */

  }, {
    key: '_validateInputs',
    value: function _validateInputs(inputs) {
      var shapes = inputs.map(function (x) {
        return x.tensor.shape.slice();
      });
      if (['sum', 'mul', 'ave', 'max'].indexOf(this.mode) > -1) {
        if (!shapes.every(function (shape) {
          return (0, _isEqual2.default)(shape, shapes[0]);
        })) {
          throw new Error(`${this.name} [${this.layerClass} layer] All input shapes must be the same for mode ${this.mode}.`);
        }
      }
      if (this.mode === 'dot') {
        if (inputs.length !== 2) {
          throw new Error(`${this.name} [${this.layerClass} layer] Exactly 2 inputs required for mode ${this.mode}.`);
        }
        if (this.dotAxes[0] < 0) {
          this.dotAxes[0] = shapes[0].length + this.dotAxes[0];
        }
        if (this.dotAxes[1] < 0) {
          this.dotAxes[1] = shapes[1].length + this.dotAxes[1];
        }
        if (shapes[0][this.dotAxes[0]] !== shapes[1][this.dotAxes[1]]) {
          throw new Error(`${this.name} [${this.layerClass} layer] Dimensions incompatibility using dot mode.`);
        }
      } else if (this.mode === 'concat') {
        var nonConcatShapes = shapes.slice();
        var _concatAxis = this.concatAxis < 0 ? nonConcatShapes[0].length + this.concatAxis : this.concatAxis;
        if (this.concatAxis === 0) _concatAxis = 0;
        (0, _range2.default)(nonConcatShapes.length).forEach(function (i) {
          nonConcatShapes[i].splice(_concatAxis, 1);
        });
        if (!nonConcatShapes.every(function (shape) {
          return (0, _isEqual2.default)(shape, nonConcatShapes[0]);
        })) {
          throw new Error(`${this.name} [${this.layerClass} layer] In concat mode, all shapes must be the same except along the concat axis.`);
        }
      }
      return true;
    }

    /**
     * CPU call
     * @param {Tensor[]} inputs
     */

  }, {
    key: '_call_cpu',
    value: function _call_cpu(inputs) {}
    // implemented in child classes


    /**
     * GPU call
     * mode: sum, mul, ave, max
     * method for mode concat/dot implemented in child class
     * @param {Tensor[]} inputs
     */

  }, {
    key: '_call_gpu',
    value: function _call_gpu(inputs) {
      // create output textures if doesn't already exist
      if (!this.output) {
        this.output = new _Tensor2.default([], inputs[0].glTextureShape);
        this.output.createGLTexture();
        if (inputs[0].glTextureIsTiled) {
          this.output.glTextureIsTiled = inputs[0].glTextureIsTiled;
          this.output.untiledShape = inputs[0].untiledShape;
        }
      }

      var numInputs = inputs.length;

      _WebGL.webgl2.selectProgram(this.mergeProgram);
      _WebGL.webgl2.bindOutputTexture(this.output.glTexture, this.output.glTextureShape);
      var uniforms = [].concat(_toConsumableArray(this.output.glTextureShape));
      var uniformTypes = ['int', 'int'];
      var uniformNames = ['rows', 'cols'];
      if (this.mode === 'ave') {
        uniforms.push(numInputs);
        uniformTypes.push('int');
        uniformNames.push('numInputs');
      }
      _WebGL.webgl2.bindUniforms(this.mergeProgram, uniforms, uniformTypes, uniformNames);

      var textures = [inputs[0].glTexture, inputs[1].glTexture];
      var textureTypes = ['2d', '2d'];
      var textureNames = ['input1', 'input2'];
      _WebGL.webgl2.bindInputTextures(this.mergeProgram, textures, textureTypes, textureNames);
      _WebGL.webgl2.runProgram();

      if (numInputs > 2) {
        if (!this.runningOutput) {
          this.runningOutput = new _Tensor2.default([], inputs[0].glTextureShape);
          this.runningOutput.createGLTexture();
        }

        for (var i = 2; i < numInputs; i++) {
          // copy output texture to intermediate output
          _WebGL.webgl2.selectProgram(this.copyTextureProgram);
          _WebGL.webgl2.bindOutputTexture(this.runningOutput.glTexture, this.runningOutput.glTextureShape);
          _WebGL.webgl2.bindInputTextures(this.copyTextureProgram, [this.output.glTexture], ['2d'], ['source']);
          _WebGL.webgl2.runProgram();

          _WebGL.webgl2.bindUniforms(this.mergeProgram, [i], ['int'], ['i']);
          var _textures = [this.runningOutput.glTexture, inputs[i].glTexture];
          _WebGL.webgl2.bindInputTextures(this.mergeProgram, _textures, textureTypes, textureNames);
          _WebGL.webgl2.runProgram();
        }
      }

      // GPU -> CPU data transfer
      if (this.outbound.length === 0) {
        this.output.transferFromGLTexture();
      }
    }
  }]);

  return _Merge;
}(_Layer3.default);

exports.default = _Merge;