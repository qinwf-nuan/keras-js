"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WebGLLayer = function () {
  function WebGLLayer() {
    _classCallCheck(this, WebGLLayer);

    this.MAX_NUM_TEXTURES = 8;

    this.webgl = weblas.gpu.gl;
    this.numTextures = 8;
  }

  _createClass(WebGLLayer, [{
    key: "_bindInputTexture",


    /**
     * Bind WebGL input texture.
     *
     * @param {WebGLProgram} program - shader program
     * @param {WebGLTexture} texture - texels data
     * @param {number} textureUnit - e.g., gl.TEXTURE0
     * @param {string} name - uniform name in shader program
     */
    value: function _bindInputTexture(program, texture, textureUnit, name) {
      var gl = this.webgl.context;

      gl.activeTexture(textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      var sampler = gl.getUniformLocation(program, name);
      gl.uniform1i(sampler, textureUnit - gl.TEXTURE0);
    }

    /**
     * Runs WebGL fragment shader program to perform computation.
     */

  }, {
    key: "_compute",
    value: function _compute() {
      var gl = this.webgl.context;
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    /**
     * Clean-up: unbind WebGL input textures.
     */

  }, {
    key: "_unbindInputTextures",
    value: function _unbindInputTextures() {
      var gl = this.webgl.context;
      for (var i = 0; i < this.numTextures; i++) {
        this.webgl.unbindInputTexture(gl.TEXTURE0 + i);
      }
    }
  }]);

  return WebGLLayer;
}();

exports.default = WebGLLayer;