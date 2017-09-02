'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _toPairs = require('lodash/toPairs');

var _toPairs2 = _interopRequireDefault(_toPairs);

var _mapKeys = require('lodash/mapKeys');

var _mapKeys2 = _interopRequireDefault(_mapKeys);

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

var _values = require('lodash/values');

var _values2 = _interopRequireDefault(_values);

var _sum = require('lodash/sum');

var _sum2 = _interopRequireDefault(_sum);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

var _every = require('lodash/every');

var _every2 = _interopRequireDefault(_every);

var _layers = require('./layers');

var layers = _interopRequireWildcard(_layers);

var _Tensor = require('./Tensor');

var _Tensor2 = _interopRequireDefault(_Tensor);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axiosSource = _axios2.default.CancelToken.source();

/**
 * Model class
 */

var Model = function () {
  /**
   * create new Model class
   * @param {object} config.filepaths
   * @param {string} config.filepaths.modelFilepath - path to model architecture configuration (json)
   * @param {string} config.filepaths.weightsFilepath - path to weights data (arraybuffer)
   * @param {string} config.filepaths.metadataFilepath - path to weights metadata (json)
   * @param {object} [config.headers] - any additional HTTP headers required for resource fetching
   * @param {boolean} [config.gpu] - enable GPU
   * @param {boolean} [config.pipeline] - configure capable layers to run in pipeline mode (gpu must be enabled)
   * @param {boolean} [config.layerCallPauses] - force next tick after each layer call
   */
  function Model() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Model);

    var _config$filepaths = config.filepaths,
        filepaths = _config$filepaths === undefined ? {} : _config$filepaths,
        _config$headers = config.headers,
        headers = _config$headers === undefined ? {} : _config$headers,
        _config$filesystem = config.filesystem,
        filesystem = _config$filesystem === undefined ? false : _config$filesystem,
        _config$gpu = config.gpu,
        gpu = _config$gpu === undefined ? false : _config$gpu,
        _config$pipeline = config.pipeline,
        pipeline = _config$pipeline === undefined ? false : _config$pipeline,
        _config$layerCallPaus = config.layerCallPauses,
        layerCallPauses = _config$layerCallPaus === undefined ? false : _config$layerCallPaus;


    if (!filepaths.model || !filepaths.weights || !filepaths.metadata) {
      throw new Error('File paths must be declared for model, weights, and metadata.');
    }
    this.filepaths = filepaths;
    this.filetypes = { model: 'json', weights: 'arraybuffer', metadata: 'json'

      // HTTP(S) headers used during data fetching
    };this.headers = headers;

    // specifies that data files are from local file system
    // only in node
    this.filesystem = typeof window !== 'undefined' ? false : filesystem;

    // flag to enable GPU where possible (disable in node environment)
    this.gpu = typeof window !== 'undefined' ? gpu : false;
    // flag to enable GPU pipeline mode where possible
    this.pipeline = this.gpu ? pipeline : false;
    // flag to enable 0 ms pauses after layer computation calls
    this.layerCallPauses = layerCallPauses;

    this.data = {
      // object representing the model architecture configuration,
      // directly from the to_json() method in Keras
      model: {},
      // ArrayBuffer of all the weights, sequentially concatenated
      // see encoder.py for construction details - essentially the raw flattened
      // numerical data from the HDF5 file is extracted sequentially and concatenated.
      weights: null,
      // array of weight tensor metadata, used to reconstruct tensors from the raw
      // weights ArrayBuffer above.
      metadata: []

      // data request progress
    };this.dataRequestProgress = { model: 0, weights: 0, metadata: 0

      // map of model layers
    };this.modelLayersMap = new Map();

    // array of model layer names with result
    this.layersWithResults = [];

    // directed acyclic graph of model network
    this.modelDAG = {};

    // input tensors
    this.inputTensors = {};

    // Promise for when Model class is initialized
    this._ready = this._initialize();

    // flag while computations are being performed
    this.isRunning = false;
  }

  /**
   * Promise for when model data is loaded and layers are initialized.
   * @returns {Promise}
   */


  _createClass(Model, [{
    key: 'ready',
    value: function ready() {
      return this._ready;
    }

    /**
     * Cancels any existing data requests
     */

  }, {
    key: '_interrupt',
    value: function _interrupt() {
      axiosSource.cancel();
    }

    /**
     * Model initialization
     * @returns {Promise}
     */

  }, {
    key: '_initialize',
    value: function _initialize() {
      var _this = this;

      var dataTypes = ['model', 'weights', 'metadata'];
      return _bluebird2.default.all(dataTypes.map(function (type) {
        return _this.filesystem ? _this._dataRequestFS(type) : _this._dataRequestHTTP(type, _this.headers);
      })).then(function () {
        _this._createLayers();
        return _bluebird2.default.resolve();
      }).catch(function (err) {
        console.log(err);
        _this._interrupt();
      });
    }

    /**
     * Makes data FS request (node only)
     * @async
     * @param {string} type - type of requested data, one of `model`, `weights`, or `metadata`.
     * @returns {Promise}
     */

  }, {
    key: '_dataRequestFS',
    value: function _dataRequestFS(type) {
      var _this2 = this;

      var readFile = _bluebird2.default.promisify(require('fs').readFile);
      var filetype = this.filetypes[type];
      var encoding = filetype === 'json' ? 'utf8' : undefined;
      return readFile(this.filepaths[type], encoding).then(function (data) {
        if (filetype === 'json') {
          _this2.data[type] = JSON.parse(data);
        } else if (filetype === 'arraybuffer') {
          _this2.data[type] = data.buffer;
        } else {
          throw new Error(`Invalid file type: ${filetype}`);
        }
        _this2.dataRequestProgress[type] = 100;
      }).catch(function (err) {
        throw err;
      });
    }

    /**
     * Makes data HTTP request (browser or node)
     * @async
     * @param {string} type - type of requested data, one of `model`, `weights`, or `metadata`.
     * @param {Object} [headers] - any headers to be passed along with request
     * @returns {Promise}
     */

  }, {
    key: '_dataRequestHTTP',
    value: function _dataRequestHTTP(type) {
      var _this3 = this;

      var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      return _axios2.default.get(this.filepaths[type], {
        responseType: this.filetypes[type],
        headers,
        onDownloadProgress: function onDownloadProgress(e) {
          if (e.lengthComputable) {
            var percentComplete = Math.round(100 * e.loaded / e.total);
            _this3.dataRequestProgress[type] = percentComplete;
          }
        },
        cancelToken: axiosSource.token
      }).then(function (res) {
        _this3.data[type] = res.data;
        _this3.dataRequestProgress[type] = 100;
      }).catch(function (err) {
        if (_axios2.default.isCancel(err)) {
          console.log('Data request canceled', err.message);
        } else {
          throw err;
        }
      });
    }

    /**
     * Loading progress calculated from all the data requests combined.
     * @returns {number} progress
     */

  }, {
    key: 'getLoadingProgress',
    value: function getLoadingProgress() {
      var progressValues = (0, _values2.default)(this.dataRequestProgress);
      return Math.round((0, _sum2.default)(progressValues) / progressValues.length);
    }

    /**
     * Toggle GPU mode on/off
     * Iterate through all layers and set `gpu` attribute
     * @param {boolean} mode - on/off
     */

  }, {
    key: 'toggleGpu',
    value: function toggleGpu(mode) {
      if (typeof mode === 'undefined') {
        this.gpu = !this.gpu;
      } else {
        this.gpu = mode;
      }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.modelLayersMap.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var layer = _step.value;

          layer.toggleGpu(this.gpu);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Builds network layer DAG
     *
     * For Keras models of class Sequential, we still convert the list into DAG format
     * for straightforward interoperability with graph models. We must first create an
     * Input layer as the initial layer, however.
     *
     * For class Model, the network DAG is constructed from the configuration inbound
     * and outbound nodes. Note that Models can have layers be entire Sequential branches.
     */

  }, {
    key: '_createLayers',
    value: function _createLayers() {
      var _this4 = this;

      var modelClass = this.data.model.class_name;

      var modelConfig = [];
      if (modelClass === 'Sequential') {
        modelConfig = this.data.model.config;
      } else if (modelClass === 'Model') {
        modelConfig = this.data.model.config.layers;
      }

      if (!(Array.isArray(modelConfig) && modelConfig.length)) {
        throw new Error('Model configuration does not contain any layers.');
      }

      modelConfig.forEach(function (layerDef, index) {
        var layerClass = layerDef.class_name;
        var layerConfig = layerDef.config;

        if (modelClass === 'Model' && layerClass === 'Sequential') {
          // when layer is a Sequential branch in a Model
          layerConfig.forEach(function (branchLayerDef, branchIndex) {
            var branchLayerClass = branchLayerDef.class_name;
            var branchLayerConfig = branchLayerDef.config;

            var branchInboundLayerNames = branchIndex === 0 ? layerDef.inbound_nodes[0].map(function (node) {
              return node[0];
            }) : [layerConfig[branchIndex - 1].config.name];

            _this4._createLayer(branchLayerClass, branchLayerConfig, branchInboundLayerNames);
          });
        } else if (!(layerClass in layers)) {
          throw new Error(`Layer ${layerClass} specified in model configuration is not implemented!`);
        } else {
          // create InputLayer node for Sequential class (which is not explicitly defined in config)
          // create input tensor for InputLayer specified in Model class (layer itself created later)
          if (modelClass === 'Sequential' && index === 0) {
            var inputName = 'input';
            var inputShape = layerConfig.batch_input_shape.slice(1);
            var layer = new layers.InputLayer({ name: inputName, shape: inputShape });
            _this4.modelLayersMap.set(inputName, layer);
            _this4.modelDAG[inputName] = { layerClass: 'InputLayer', name: inputName, inbound: [], outbound: [] };
            _this4.inputTensors[inputName] = new _Tensor2.default([], inputShape);
          } else if (modelClass === 'Model' && layerClass === 'InputLayer') {
            var _inputShape = layerConfig.batch_input_shape.slice(1);
            _this4.inputTensors[layerConfig.name] = new _Tensor2.default([], _inputShape);
          }

          var inboundLayerNames = [];
          if (modelClass === 'Sequential') {
            if (index === 0) {
              inboundLayerNames = ['input'];
            } else {
              inboundLayerNames = [modelConfig[index - 1].config.name];
            }
          } else if (modelClass === 'Model') {
            var inboundNodes = layerDef.inbound_nodes;
            if (inboundNodes && inboundNodes.length) {
              inboundLayerNames = inboundNodes[0].map(function (node) {
                return node[0];
              });
            }
          }

          _this4._createLayer(layerClass, layerConfig, inboundLayerNames);
        }
      });
    }

    /**
     * Create single layer.
     * @param {String} layerClass
     * @param {Object} layerConfig
     * @param {Array<String>} inboundLayerNames
     * @param {Boolean} isSequential
     */

  }, {
    key: '_createLayer',
    value: function _createLayer(layerClass, layerConfig, inboundLayerNames) {
      var _this5 = this;

      var layer = void 0;
      if (layerClass === 'Bidirectional' || layerClass === 'TimeDistributed') {
        // create wrapper layers
        var wrappedLayerConfig = layerConfig.layer.config;
        var wrappedLayerClass = layerConfig.layer.class_name;
        wrappedLayerConfig.gpu = this.gpu;

        layer = new layers[layerClass](Object.assign({}, layerConfig, { layer: new layers[wrappedLayerClass](wrappedLayerConfig) }));
      } else {
        // create regular layers
        layer = new layers[layerClass](Object.assign({ gpu: this.gpu, pipeline: this.pipeline }, layerConfig));
      }

      // layer weights
      var weightNames = [];
      if (layerClass === 'Bidirectional') {
        var forwardWeightNames = layer.forwardLayer.params.map(function (param) {
          return `${layerConfig.name}/forward_${layerConfig.layer.config.name}/${param}`;
        });
        var backwardWeightNames = layer.backwardLayer.params.map(function (param) {
          return `${layerConfig.name}/backward_${layerConfig.layer.config.name}/${param}`;
        });
        weightNames = forwardWeightNames.concat(backwardWeightNames);
      } else if (layerClass === 'TimeDistributed') {
        weightNames = layer.layer.params.map(function (param) {
          return `${layerConfig.name}/${param}`;
        });
      } else {
        weightNames = layer.params.map(function (param) {
          return `${layerConfig.name}/${param}`;
        });
      }
      if (weightNames && weightNames.length) {
        var weights = weightNames.map(function (weightName) {
          var paramMetadata = (0, _find2.default)(_this5.data.metadata, function (meta) {
            var weightRE = new RegExp(`^${weightName}`);
            return weightRE.test(meta.weight_name);
          });
          if (!paramMetadata) {
            throw new Error(`[Model] error loading weights.`);
          }

          var offset = paramMetadata.offset,
              length = paramMetadata.length,
              shape = paramMetadata.shape;

          return new _Tensor2.default(new Float32Array(_this5.data.weights, offset, length), shape);
        });
        layer.setWeights(weights);
      }

      this.modelLayersMap.set(layerConfig.name, layer);
      this.modelDAG[layerConfig.name] = { layerClass, name: layerConfig.name, inbound: [], outbound: [] };

      inboundLayerNames.forEach(function (layerName) {
        _this5.modelDAG[layerConfig.name].inbound.push(layerName);
        _this5.modelDAG[layerName].outbound.push(layerConfig.name);
      });
    }

    /**
     * Runs .call() on merge layer
     * @param {Layer} currentLayer
     * @param {Layer[]} inboundLayers
     * @param {boolean} copyBeforeCall
     * @returns {Tensor}
     */

  }, {
    key: '_mergeLayerCall',
    value: function _mergeLayerCall(currentLayer, inboundLayers, copyBeforeCall) {
      var inputs = inboundLayers.map(function (layer) {
        return layer.result;
      });
      var canRunInPipeline = inputs.every(function (x) {
        return x._fromPipeline;
      });
      if (!canRunInPipeline || !currentLayer._pipelineEnabled) {
        // If currentLayer is not pipeline enabled, then all inbound results
        // must first be converted from weblas tensors to regular tensors, if
        // necessary.
        // If currentLayer is pipeline enabled, but not all inbound results are
        // from pipeline mode, then all must still be converted from weblas
        // tensors to regular tensors.
        inputs = inputs.map(function (x, i) {
          if (x._fromPipeline) {
            // copy from weblas tensor into regular tensor
            return inboundLayers[i].transferFromPipeline(x);
          } else if (copyBeforeCall) {
            // make a copy of regular tensor
            return new _Tensor2.default(x.tensor.data, x.tensor.shape);
          }
          return x;
        });
      } else if (copyBeforeCall) {
        // If currentLayer is pipeline enabled, and all inbound results are from
        // pipeline mode as well, but there are sibling layer nodes that require
        // the same input(s) (thus copyBeforeCall is true), then we directly copy
        // the weblas tensors.
        inputs = inputs.map(function (x) {
          var xNew = new _Tensor2.default([], x.tensor.shape);
          xNew.copyFromWeblasTensor(x.weblasTensor);
          xNew._fromPipeline = true;
          xNew._actualShape = x._actualShape.slice();
          return xNew;
        });
      }

      return currentLayer.call(inputs);
    }

    /**
     * Runs .call() on regular layer
     * @param {Layer} currentLayer
     * @param {Layer} inboundLayer
     * @param {boolean} copyBeforeCall
     * @returns {Tensor}
     */

  }, {
    key: '_regularLayerCall',
    value: function _regularLayerCall(currentLayer, inboundLayer, copyBeforeCall) {
      var inboundLayerResult = inboundLayer.result;
      if (!inboundLayerResult._fromPipeline || !currentLayer._pipelineEnabled) {
        // If currentLayer is not pipeline enabled or inbound layer result is not
        // from pipeline mode, then result must first be converted from a weblas
        // tensor to a regular tensor, if necessary.
        if (inboundLayerResult._fromPipeline) {
          // copy from weblas tensor into regular tensor
          inboundLayerResult = inboundLayer.transferFromPipeline(inboundLayerResult);
        } else if (copyBeforeCall) {
          // make a copy of regular tensor
          inboundLayerResult = new _Tensor2.default(inboundLayerResult.tensor.data, inboundLayerResult.tensor.shape);
        }
      } else if (copyBeforeCall) {
        // If currentLayer is pipeline enabled, and prev layer result is from
        // pipeline mode as well, but there are sibling layer nodes that require
        // the same input (thus copyBeforeCall is true), then we directly copy
        // the weblas tensor.
        var xNew = new _Tensor2.default([], inboundLayerResult.tensor.shape);
        xNew.copyFromWeblasTensor(inboundLayerResult.weblasTensor);
        xNew._fromPipeline = true;
        xNew._actualShape = inboundLayerResult._actualShape.slice();
        inboundLayerResult = xNew;
      }

      return currentLayer.call(inboundLayerResult);
    }

    /**
     * Async function for recursively traversing the DAG
     * Graph object is stored in `this.modelDAG`, keyed by layer name.
     * Layers are retrieved from Map object `this.modelLayersMap`.
     * @async
     * @param {[]string} nodes - array of layer names
     * @returns {Promise.<boolean>}
     */

  }, {
    key: '_traverseDAG',
    value: function () {
      var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/regeneratorRuntime.mark(function _callee(nodes) {
        var _this6 = this;

        var node, _modelDAG$node, layerClass, inbound, outbound, currentLayer, inboundLayers, numSiblingNodes, copyBeforeCall;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(nodes.length === 0)) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt('return', true);

              case 4:
                if (!(nodes.length === 1)) {
                  _context.next = 30;
                  break;
                }

                // Where computational logic lives for a given layer node
                // - Makes sure results are available from inbound layer nodes
                // - Keeps generator going until results are available from inbound layer nodes
                //   (important for merge layer nodes where multiple inbound nodes may
                //    complete asynchronously)
                // - Runs computation for current layer node: .call()
                // - Starts new generator function for outbound nodes
                node = nodes[0];
                _modelDAG$node = this.modelDAG[node], layerClass = _modelDAG$node.layerClass, inbound = _modelDAG$node.inbound, outbound = _modelDAG$node.outbound;

                if (!(layerClass !== 'InputLayer')) {
                  _context.next = 25;
                  break;
                }

                currentLayer = this.modelLayersMap.get(node);

                if (!currentLayer.visited) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt('return', false);

              case 11:
                inboundLayers = inbound.map(function (n) {
                  return _this6.modelLayersMap.get(n);
                });

                if ((0, _every2.default)(inboundLayers.map(function (layer) {
                  return layer.hasResult;
                }))) {
                  _context.next = 14;
                  break;
                }

                return _context.abrupt('return', false);

              case 14:
                numSiblingNodes = inbound.map(function (n) {
                  return _this6.modelDAG[n].outbound;
                }).reduce(function (num, outbound) {
                  return num + outbound.length;
                }, 0);
                copyBeforeCall = numSiblingNodes >= 1;


                if (['Merge', 'Add', 'Multiply', 'Average', 'Maximum', 'Concatenate', 'Dot'].includes(layerClass)) {
                  currentLayer.result = this._mergeLayerCall(currentLayer, inboundLayers, copyBeforeCall);
                } else {
                  currentLayer.result = this._regularLayerCall(currentLayer, inboundLayers[0], copyBeforeCall);
                }

                currentLayer.hasResult = true;
                currentLayer.visited = true;
                this.layersWithResults.push(currentLayer.name);

                if (!this.layerCallPauses) {
                  _context.next = 23;
                  break;
                }

                _context.next = 23;
                return _bluebird2.default.delay(0);

              case 23:
                _context.next = 26;
                break;

              case 25:
                this.layersWithResults.push(this.modelLayersMap.get(node).name);

              case 26:
                _context.next = 28;
                return this._traverseDAG(outbound);

              case 28:
                _context.next = 32;
                break;

              case 30:
                _context.next = 32;
                return _bluebird2.default.all(nodes.map(function (node) {
                  return _this6._traverseDAG([node]);
                }));

              case 32:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _traverseDAG(_x3) {
        return _ref.apply(this, arguments);
      }

      return _traverseDAG;
    }()

    /**
     * Predict
     * @async
     * @param {Object} inputData - object where the keys are the named inputs of the model,
     *                             and values the TypedArray numeric data
     * @returns {Promise.<Object>} - outputData object where the keys are the named outputs
     *                             of the model, and values the TypedArray numeric data
     */

  }, {
    key: 'predict',
    value: function () {
      var _ref2 = (0, _bluebird.coroutine)( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(inputData) {
        var _this7 = this;

        var inputNames, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, layer, modelClass, outputLayer, _modelLayersMap$get, result, outputData, outputLayers, _outputData;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.isRunning = true;

                inputNames = (0, _keys2.default)(this.inputTensors).sort();

                if ((0, _isEqual2.default)((0, _keys2.default)(inputData).sort(), inputNames)) {
                  _context2.next = 5;
                  break;
                }

                this.isRunning = false;
                throw new Error(`predict() must take an object where the keys are the named inputs of the model: ${inputNames}.`);

              case 5:
                if ((0, _every2.default)(inputNames, function (inputName) {
                  return inputData[inputName] instanceof Float32Array;
                })) {
                  _context2.next = 8;
                  break;
                }

                this.isRunning = false;
                throw new Error('predict() must take an object where the values are the flattened data as Float32Array.');

              case 8:

                // reset hasResult and visited flags in all layers
                this.layersWithResults = [];
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context2.prev = 12;
                for (_iterator2 = this.modelLayersMap.values()[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  layer = _step2.value;

                  layer.hasResult = false;
                  layer.visited = false;
                }

                // load data to input tensors
                _context2.next = 20;
                break;

              case 16:
                _context2.prev = 16;
                _context2.t0 = _context2['catch'](12);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t0;

              case 20:
                _context2.prev = 20;
                _context2.prev = 21;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 23:
                _context2.prev = 23;

                if (!_didIteratorError2) {
                  _context2.next = 26;
                  break;
                }

                throw _iteratorError2;

              case 26:
                return _context2.finish(23);

              case 27:
                return _context2.finish(20);

              case 28:
                inputNames.forEach(function (inputName) {
                  var inputLayer = _this7.modelLayersMap.get(inputName);
                  _this7.inputTensors[inputName].replaceTensorData(inputData[inputName]);
                  inputLayer.result = inputLayer.call(_this7.inputTensors[inputName]);
                  inputLayer.hasResult = true;
                  inputLayer.visited = true;
                });

                // start traversing DAG at input
                _context2.next = 31;
                return this._traverseDAG(inputNames);

              case 31:

                // outputs are layers with no outbound nodes
                modelClass = this.data.model.class_name;

                if (!(modelClass === 'Sequential')) {
                  _context2.next = 40;
                  break;
                }

                outputLayer = (0, _find2.default)((0, _values2.default)(this.modelDAG), function (node) {
                  return !node.outbound.length;
                });
                _modelLayersMap$get = this.modelLayersMap.get(outputLayer.name), result = _modelLayersMap$get.result;
                outputData = { output: result.tensor.data };

                this.isRunning = false;
                return _context2.abrupt('return', outputData);

              case 40:
                if (!(modelClass === 'Model')) {
                  _context2.next = 46;
                  break;
                }

                outputLayers = (0, _values2.default)(this.modelDAG).filter(function (node) {
                  return !node.outbound.length;
                });
                _outputData = {};

                outputLayers.forEach(function (layer) {
                  var _modelLayersMap$get2 = _this7.modelLayersMap.get(layer.name),
                      result = _modelLayersMap$get2.result;

                  _outputData[layer.name] = result.tensor.data;
                });
                this.isRunning = false;
                return _context2.abrupt('return', _outputData);

              case 46:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[12, 16, 20, 28], [21,, 23, 27]]);
      }));

      function predict(_x4) {
        return _ref2.apply(this, arguments);
      }

      return predict;
    }()
  }]);

  return Model;
}();

exports.default = Model;