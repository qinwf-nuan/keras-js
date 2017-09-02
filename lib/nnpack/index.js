'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global nnpack */


var _enums = require('./enums');

var enums = _interopRequireWildcard(_enums);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NNPACK = function () {
  function NNPACK() {
    _classCallCheck(this, NNPACK);

    this.initialized = false;
    this.initialize();
    this.threadpool = null;
  }

  _createClass(NNPACK, [{
    key: 'initialize',
    value: function () {
      var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var i, status;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                i = 0;

              case 1:
                if (!(i < 10000)) {
                  _context.next = 12;
                  break;
                }

                if (nnpack.usingWasm) {
                  _context.next = 7;
                  break;
                }

                _context.next = 5;
                return _bluebird2.default.delay(1);

              case 5:
                _context.next = 9;
                break;

              case 7:
                console.log(`[NNPACK WebAssembly module] created in ${i} ms.`);
                return _context.abrupt('break', 12);

              case 9:
                i++;
                _context.next = 1;
                break;

              case 12:
                if (nnpack.usingWasm) {
                  _context.next = 15;
                  break;
                }

                this.initialized = false;
                throw new Error('[NNPACK WebAssembly module] failed to create module.');

              case 15:

                //NOTE: no support for multiple threads in WebAssembly yet
                this.threadpool = nnpack.ccall('pthreadpool_create', 'number', ['number'], [0]);

                status = nnpack.ccall('nnp_initialize');

                if (!(status !== enums.NNP_STATUS.SUCCESS)) {
                  _context.next = 19;
                  break;
                }

                throw new Error(`[NNPACK WebAssembly module] initialization failed: error code ${status}.`);

              case 19:

                this.initialized = true;

              case 20:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function initialize() {
        return _ref.apply(this, arguments);
      }

      return initialize;
    }()
  }, {
    key: 'deinitialize',
    value: function deinitialize() {
      nnpack.ccall('nnp_deinitialize');
    }

    /**
     * wrapper for nnp_convolution_inference
     */

  }, {
    key: 'convolutionInference',
    value: function convolutionInference() {}

    /**
     * wrapper for nnp_fully_connected_inference
     */

  }, {
    key: 'fullyConnectedInference',
    value: function fullyConnectedInference() {}

    /**
     * wrapper for nnp_max_pooling_output
     */

  }, {
    key: 'maxPoolingOutput',
    value: function maxPoolingOutput() {}

    /**
     * wrapper for nnp_softmax_output
     */

  }, {
    key: 'softmaxOutput',
    value: function softmaxOutput() {}

    /**
     * wrapper for nnp_relu_output
     */

  }, {
    key: 'reluOutput',
    value: function reluOutput(x) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _opts$alpha = opts.alpha,
          alpha = _opts$alpha === undefined ? 0 : _opts$alpha;

      var status = nnpack.ccall('nnp_relu_output', 'number', ['number', 'number', 'array', 'array', 'number', 'number'], [1, channels, input, output, alpha, this.threadpool]);
      if (status !== enums.NNP_STATUS.SUCCESS) {
        console.log(`[NNPACK WebAssembly module] nnp_relu_output error`);
      }
    }
  }]);

  return NNPACK;
}();

var nnpackInstance = new NNPACK();

exports.default = nnpackInstance;