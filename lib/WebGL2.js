'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebGL2 = function () {
  function WebGL2() {
    _classCallCheck(this, WebGL2);

    this.isSupported = false;

    this.vertexShader = null;
    this.textureUnitMap = null;
    this.textureUnitCounter = 0;

    if (typeof window !== 'undefined') {
      // this.canvas = document.createElement('canvas')
      this.context = this.canvas.getContext('webgl2');

      var gl = this.context;
      if (gl) {
        this.isSupported = true;
        gl.getExtension('EXT_color_buffer_float');
        this.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        this.MAX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this.init();
      } else {
        console.log('Unable to initialize WebGL2 -- your browser may not support it.');
      }
    }
  }

  /**
   * Intialization after WebGL2 detected.
   */


  _createClass(WebGL2, [{
    key: 'init',
    value: function init() {
      this.textureUnitMap = new Map();
      this.createCommonVertexShader();
    }

    /**
     * Creates and compiles passthrough vertex shader that we will attach
     * to all our programs.
     */

  }, {
    key: 'createCommonVertexShader',
    value: function createCommonVertexShader() {
      var gl = this.context;

      var source = require('./vertexShader.webgl2.glsl');

      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, source);
      gl.compileShader(vertexShader);

      var success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
      if (!success) {
        console.error(gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        this.isSupported = false;
      }

      this.vertexShader = vertexShader;
    }

    /**
     * Compiles fragment shader from source and creates program from it,
     * using our passthrough vertex shader.
     *
     * @param {String} source - fragment shader GLSL source code
     * @returns {WebGLProgram}
     */

  }, {
    key: 'compileProgram',
    value: function compileProgram(source) {
      var gl = this.context;

      // create and compile fragment shader
      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, source);
      gl.compileShader(fragmentShader);

      var success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
      if (!success) {
        console.error(gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
        this.isSupported = false;
      }

      // create program and attach compiled shaders
      var program = gl.createProgram();
      gl.attachShader(program, this.vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!success) {
        console.error(gl.getProgramInfoLog(program));
        this.isSupported = false;
      }

      return program;
    }

    /**
     * Setup vertices
     *
     * @param {WebGLProgram} program
     */

  }, {
    key: 'setupVertices',
    value: function setupVertices(program) {
      var gl = this.context;

      var position = gl.getAttribLocation(program, 'position');
      var positionVertexObj = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionVertexObj);

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(position);

      var texcoord = gl.getAttribLocation(program, 'texcoord');
      var texcoordVertexObj = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordVertexObj);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(texcoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(texcoord);

      var indicesVertexObj = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesVertexObj);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    }

    /**
     * Selects linked program as active program
     *
     * @param {WebGLProgram} program
     */

  }, {
    key: 'selectProgram',
    value: function selectProgram(program) {
      var gl = webgl2.context;
      gl.useProgram(program);
      this.setupVertices(program);
    }

    /**
     * Bind uniforms within program
     *
     * @param {WebGLProgram} program
     * @param {*[]} values
     * @param {String[]} types
     * @param {String[]} names
     */

  }, {
    key: 'bindUniforms',
    value: function bindUniforms(program, values, types, names) {
      var gl = webgl2.context;

      values.forEach(function (val, i) {
        var loc = gl.getUniformLocation(program, names[i]);
        if (types[i] === 'float' || types[i] === 'bool') {
          gl.uniform1f(loc, val);
        } else if (types[i] === 'int') {
          gl.uniform1i(loc, val);
        }
      });
    }

    /**
     * Bind input textures within program
     *
     * @param {WebGLProgram} program
     * @param {WebGLTexture[]} textures
     * @param {String[]} types
     * @param {String[]} names
     */

  }, {
    key: 'bindInputTextures',
    value: function bindInputTextures(program, textures, types, names) {
      var gl = webgl2.context;

      var targetMap = {
        '2d': gl.TEXTURE_2D,
        '2darray': gl.TEXTURE_2D_ARRAY,
        '3d': gl.TEXTURE_3D
      };

      textures.forEach(function (tex, i) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(targetMap[types[i]], tex);
        gl.uniform1i(gl.getUniformLocation(program, names[i]), i);
      });
    }

    /**
     * Bind output texture
     *
     * @param {WebGLTexture} outputTexture
     * @param {Number[]} shape
     */

  }, {
    key: 'bindOutputTexture',
    value: function bindOutputTexture(outputTexture, shape) {
      var gl = this.context;

      this.canvas.height = shape[0];
      this.canvas.width = shape[1];
      gl.viewport(0, 0, shape[1], shape[0]);

      this.framebuffer = this.framebuffer || gl.createFramebuffer();

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, outputTexture, 0);
      var success = gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE;
      if (!success) {
        throw new Error('Error binding output framebuffer.');
      }
    }

    /**
     * Runs fragment shader program
     */

  }, {
    key: 'runProgram',
    value: function runProgram() {
      var gl = this.context;
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    /**
     * Reads pixel data from framebuffer
     *
     * @param {Number[]} shape
     */

  }, {
    key: 'readData',
    value: function readData(shape) {
      var gl = this.context;
      var buf = new ArrayBuffer(shape[0] * shape[1] * 4 * 4);
      var view = new Float32Array(buf);
      gl.readPixels(0, 0, shape[1], shape[0], gl.RGBA, gl.FLOAT, view);
      var out = [];
      for (var i = 0; i < view.length; i += 4) {
        out.push(view[i]);
      }
      return new Float32Array(out);
    }
  }]);

  return WebGL2;
}();

var webgl2 = new WebGL2();
var MAX_TEXTURE_SIZE = webgl2.MAX_TEXTURE_SIZE;
var MAX_TEXTURE_IMAGE_UNITS = webgl2.MAX_TEXTURE_IMAGE_UNITS;

exports.webgl2 = webgl2;
exports.MAX_TEXTURE_SIZE = MAX_TEXTURE_SIZE;
exports.MAX_TEXTURE_IMAGE_UNITS = MAX_TEXTURE_IMAGE_UNITS;