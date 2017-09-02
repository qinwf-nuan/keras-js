'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Tensor = require('../../Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

var _Layer2 = require('../../Layer');

var _Layer3 = _interopRequireDefault(_Layer2);

var _ndarrayGemm = require('ndarray-gemm');

var _ndarrayGemm2 = _interopRequireDefault(_ndarrayGemm);

var _ndarrayOps = require('ndarray-ops');

var _ndarrayOps2 = _interopRequireDefault(_ndarrayOps);

var _ndarrayUnsqueeze = require('ndarray-unsqueeze');

var _ndarrayUnsqueeze2 = _interopRequireDefault(_ndarrayUnsqueeze);

var _ndarrayConcatRows = require('ndarray-concat-rows');

var _ndarrayConcatRows2 = _interopRequireDefault(_ndarrayConcatRows);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Merge layer class
 */
var Merge = function (_Layer) {
  _inherits(Merge, _Layer);

  /**
   * Creates a Merge layer
   * @param {Object} [attrs] - layer attributes
   */
  function Merge() {
    var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Merge);

    var _this = _possibleConstructorReturn(this, (Merge.__proto__ || Object.getPrototypeOf(Merge)).call(this, attrs));

    _this.layerClass = 'Merge';

    var _attrs$mode = attrs.mode,
        mode = _attrs$mode === undefined ? 'sum' : _attrs$mode,
        _attrs$concat_axis = attrs.concat_axis,
        concat_axis = _attrs$concat_axis === undefined ? -1 : _attrs$concat_axis,
        _attrs$dot_axes = attrs.dot_axes,
        dot_axes = _attrs$dot_axes === undefined ? -1 : _attrs$dot_axes;


    var availableModes = ['sum', 'mul', 'concat', 'ave', 'cos', 'dot', 'max'];
    if (availableModes.indexOf(mode) > -1) {
      _this.mode = mode;
    } else {
      throw new Error(`${_this.name} [Merge layer] ${mode} not available.`);
    }

    // no mini-batch axis here, so we subtract 1 if given axis > 0
    _this.concatAxis = concat_axis <= 0 ? concat_axis : concat_axis - 1;
    if (Array.isArray(dot_axes)) {
      _this.dotAxes = [dot_axes[0] <= 0 ? dot_axes[0] : dot_axes[0] - 1, dot_axes[1] <= 0 ? dot_axes[1] : dot_axes[1] - 1];
    } else {
      _this.dotAxes = [dot_axes <= 0 ? dot_axes : dot_axes - 1, dot_axes <= 0 ? dot_axes : dot_axes - 1];
    }
    return _this;
  }

  /**
   * Internal method for validating inputs
   * @param {Tensor[]} inputs
   * @returns {boolean} valid
   */


  _createClass(Merge, [{
    key: '_validateInputs',
    value: function _validateInputs(inputs) {
      var shapes = inputs.map(function (x) {
        return x.tensor.shape.slice();
      });
      if (['sum', 'mul', 'ave', 'cos', 'max'].indexOf(this.mode) > -1) {
        if (!shapes.every(function (shape) {
          return (0, _isEqual2.default)(shape, shapes[0]);
        })) {
          throw new Error(`${this.name} [Merge layer] All input shapes must be the same for mode ${this.mode}.`);
        }
      }
      if (['cos', 'dot'].indexOf(this.mode) > -1) {
        if (inputs.length !== 2) {
          throw new Error(`${this.name} [Merge layer] Exactly 2 inputs required for mode ${this.mode}.`);
        }
        if (this.dotAxes[0] < 0) {
          this.dotAxes[0] = shapes[0].length + this.dotAxes[0];
        }
        if (this.dotAxes[1] < 0) {
          this.dotAxes[1] = shapes[1].length + this.dotAxes[1];
        }
        if (shapes[0][this.dotAxes[0]] !== shapes[1][this.dotAxes[1]]) {
          throw new Error(`${this.name} [Merge layer] Dimensions incompatibility using dot mode.`);
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
          throw new Error(`${this.name} [Merge layer] In concat mode, all shapes must be the same except along the concat axis.`);
        }
      }
      return true;
    }

    /**
     * Method for layer computational logic
     * @param {Tensor[]} inputs
     * @returns {Tensor} `this`
     */

  }, {
    key: 'call',
    value: function call(inputs) {
      var valid = this._validateInputs(inputs);
      if (!valid) {
        throw new Error(`${this.name} [Merge layer] Invalid inputs to call method.`);
      }

      var output = void 0;
      var outputShape = void 0;
      if (['sum', 'mul', 'ave', 'max'].indexOf(this.mode) > -1) {
        outputShape = inputs[0].tensor.shape.slice();
        output = new _Tensor2.default([], outputShape);
      } else if (this.mode === 'concat') {
        outputShape = inputs[0].tensor.shape.slice();
        var _concatAxis = this.concatAxis < 0 ? outputShape.length + this.concatAxis : this.concatAxis;
        if (this.concatAxis === 0) _concatAxis = 0;
        inputs.slice(1, inputs.length).forEach(function (x) {
          var d = x.tensor.shape.slice()[_concatAxis];
          outputShape[_concatAxis] += d;
        });
        output = new _Tensor2.default([], outputShape);
      } else if (['cos', 'dot'].indexOf(this.mode) > -1) {
        var shape1 = inputs[0].tensor.shape.slice();
        var shape2 = inputs[1].tensor.shape.slice();
        shape1.splice(this.dotAxes[0], 1);
        shape2.splice(this.dotAxes[1], 1);
        outputShape = shape1.concat(shape2);
        if (outputShape.length === 1) {
          outputShape.push(1);
        }
        output = new _Tensor2.default([], outputShape);
      }

      if (this.mode === 'sum') {
        for (var i = 0; i < inputs.length; i++) {
          _ndarrayOps2.default.addeq(output.tensor, inputs[i].tensor);
        }
      } else if (this.mode === 'mul') {
        _ndarrayOps2.default.assigns(output.tensor, 1.0);
        for (var _i = 0; _i < inputs.length; _i++) {
          _ndarrayOps2.default.muleq(output.tensor, inputs[_i].tensor);
        }
      } else if (this.mode === 'ave') {
        for (var _i2 = 0; _i2 < inputs.length; _i2++) {
          _ndarrayOps2.default.addeq(output.tensor, inputs[_i2].tensor);
        }
        _ndarrayOps2.default.divseq(output.tensor, inputs.length);
      } else if (this.mode === 'max') {
        _ndarrayOps2.default.assign(output.tensor, inputs[0].tensor);
        for (var _i3 = 1; _i3 < inputs.length; _i3++) {
          _ndarrayOps2.default.maxeq(output.tensor, inputs[_i3].tensor);
        }
      } else if (this.mode === 'concat') {
        var _concatAxis2 = this.concatAxis < 0 ? inputs[0].tensor.shape.length + this.concatAxis : this.concatAxis;
        if (this.concatAxis === 0) _concatAxis2 = 0;
        if (_concatAxis2 === 0) {
          (0, _ndarrayConcatRows2.default)(output.tensor, inputs.map(function (x) {
            return x.tensor;
          }));
        } else {
          var _output$tensor;

          var dimsAxisSwap = [_concatAxis2];
          for (var _i4 = 0; _i4 < inputs[0].tensor.shape.length; _i4++) {
            if (_i4 !== _concatAxis2) dimsAxisSwap.push(_i4);
          }
          (0, _ndarrayConcatRows2.default)((_output$tensor = output.tensor).transpose.apply(_output$tensor, dimsAxisSwap), inputs.map(function (x) {
            var _x$tensor;

            return (_x$tensor = x.tensor).transpose.apply(_x$tensor, dimsAxisSwap);
          }));
        }
      } else if (this.mode === 'dot') {
        if (inputs[0].tensor.shape.length === 2 && inputs[1].tensor.shape.length === 2) {
          if (this.dotAxes[0] === 0 && this.dotAxes[1] === 0) {
            (0, _ndarrayGemm2.default)(output.tensor, inputs[0].tensor.transpose(1, 0), inputs[1].tensor);
          } else if (this.dotAxes[0] === 1 && this.dotAxes[1] === 1) {
            (0, _ndarrayGemm2.default)(output.tensor, inputs[0].tensor, inputs[1].tensor.transpose(1, 0));
          }
        } else {
          throw new Error(`${this.name} [Merge layer] dot mode for 3+ dim tensors not yet implemented.`);
        }
      } else if (this.mode === 'cos') {
        if (inputs[0].tensor.shape.length === 2 && inputs[1].tensor.shape.length === 2) {
          var a = new _Tensor2.default([], output.tensor.shape);
          var b = new _Tensor2.default([], output.tensor.shape);
          if (this.dotAxes[0] === 0 && this.dotAxes[1] === 0) {
            (0, _ndarrayGemm2.default)(a.tensor, inputs[0].tensor.transpose(1, 0), inputs[0].tensor);
            (0, _ndarrayGemm2.default)(b.tensor, inputs[1].tensor.transpose(1, 0), inputs[1].tensor);
            (0, _ndarrayGemm2.default)(output.tensor, inputs[0].tensor.transpose(1, 0), inputs[1].tensor);
          } else if (this.dotAxes[0] === 1 && this.dotAxes[1] === 1) {
            (0, _ndarrayGemm2.default)(a.tensor, inputs[0].tensor, inputs[0].tensor.transpose(1, 0));
            (0, _ndarrayGemm2.default)(b.tensor, inputs[1].tensor, inputs[1].tensor.transpose(1, 0));
            (0, _ndarrayGemm2.default)(output.tensor, inputs[0].tensor, inputs[1].tensor.transpose(1, 0));
          }
          _ndarrayOps2.default.muleq(a.tensor, b.tensor);
          _ndarrayOps2.default.sqrteq(a.tensor);
          _ndarrayOps2.default.diveq(output.tensor, a.tensor);
          output.tensor = (0, _ndarrayUnsqueeze2.default)(output.tensor, 0);
        } else {
          throw new Error(`${this.name} [Merge layer] cos mode for 3+ dim tensors not yet implemented.`);
        }
      }

      return output;
    }
  }]);

  return Merge;
}(_Layer3.default);

exports.default = Merge;