define(function(require) {
    var Game     = require("meier/engine/Game");
    var Input    = require("meier/engine/Input");
    var Key      = require("meier/engine/Key");
    var V3       = require("meier/math/Vec")(3);
    var Matrix33 = require("meier/math/Mat")(3, 3);
    var Matrix44 = require("meier/math/Mat")(4, 4);
    
    var gl     = require("meier/webgl/Gl");
    var Shader = require("meier/webgl/Shader");
    var Camera = require("meier/webgl/FpsCamera");
    var Vertex = require("meier/webgl/Structs").Vertex;
    var Light  = require("meier/webgl/Structs").Light;
    
    var Cube   = require("meier/webgl/Cube");
    var Plane  = require("meier/webgl/Plane");
    
    ThreeD.prototype = new Game();
    
    function ThreeD(container) {
        Game.call(this, container);
        
        
        this.aaWidth  = this.width;// * 2;
        this.aaHeight = this.height;// * 2;
        
        
        this.load();

    }
    
    ThreeD.prototype.load = function() {
        var floatTextures = gl.getExtension('OES_texture_float');
        var ext = this.ext = gl.getExtension('WEBGL_draw_buffers');
        
        this.frame = 0;
        
        gl.viewport(0, 0, this.aaWidth, this.aaHeight);
        

        gl.canvas.style.width  = this.width;
        gl.canvas.style.height = this.height;
        gl.canvas.width        = this.width;
        gl.canvas.height       = this.height;
        
        this.htmlContainer.appendChild(gl.canvas);
        
        this.firstShader  = new Shader("./First.vsh", "./First.fsh");
        this.secondShader = new Shader("./Second.vsh", "./Second.fsh");
        
        
        this.vertices = gl.createBuffer();
        this.indices  = gl.createBuffer();
        this.nIndices = Plane.indices().length;
        this.nVertices = Plane.vertices().length / 12;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, Plane.vertices(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
         
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Plane.indices(), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        
        this.cam = new Camera(this);
        
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        //gl.depthFunc(gl.LEQUAL)
        
        this.lights = [
            new Light(new V3(4, 2, 4))
        ];
        
        // Hold output from 1st pass
        this.textures = [];
        for(var i = 0; i < 4; ++i) {
            this.textures[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.aaWidth, this.aaHeight, 0, gl.RGBA, gl.FLOAT, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        // Ties all other buffers together.
        var fbo = this.firstFbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        
        // Allocate storage.
        var rbo = this.firstRbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.aaWidth, this.aaHeight);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
        
        // Attach textures to the (shader) outputs
        for(var i = 0; i < this.textures.length; ++i) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D, this.textures[i], 0);
        }
        
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(status != gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("Broken framebuffer, code: " + status);
        }
        
        // Unbind from global state.
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        
        this.uploadUnitFrame();
    }
    
    
    /// Upload a generic frame that matches the unit screen size.
    ThreeD.prototype.uploadUnitFrame = function() {
        var vertices = new Float32Array([
               -1, -1,
                1, -1,
               -1,  1,
                1,  1,
        ]);

        // Vertex buffer object to contain the unit rectangle coordinates
        this._vboUnitFrame = gl.createBuffer();
        
        // Bind global state and upload vertices to the GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vboUnitFrame);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        this._vboUnitFrame.itemSize = 2;        // Stride: two floats
        this._vboUnitFrame.numItems = 4;        // Four in total, a pair at each corner.
        this._vboUnitFrame.length   = this._vboUnitFrame.itemSize * this._vboUnitFrame.numItems;
        
        
        // Detach VBO from global state.
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    
    ThreeD.prototype.firstPass = function(dt) {
        
        gl.viewport(0, 0, this.aaWidth, this.aaHeight);
        
        
        var ext = this.ext;
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.firstFbo);
        
        ext.drawBuffersWEBGL([
          ext.COLOR_ATTACHMENT0_WEBGL,
          ext.COLOR_ATTACHMENT1_WEBGL,
          ext.COLOR_ATTACHMENT2_WEBGL,
          ext.COLOR_ATTACHMENT3_WEBGL
        ]);
        
        gl.clearColor(0.2, 0.1, 1, 0.5);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        
        this.firstShader.use();
        

        gl.uniformMatrix4fv(this.firstShader.uniform("projection"), false, this.cam.projection()._);
        gl.uniformMatrix4fv(this.firstShader.uniform("model"), false, this.cam.model()._);
        gl.uniformMatrix4fv(this.firstShader.uniform("view"), false, this.cam.view()._);
        
        gl.uniform3fv(this.firstShader.uniform("camera"), this.cam.position._);
        
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices);
        
        
        gl.vertexAttribPointer(this.firstShader.attribute("position"), 3, gl.FLOAT, false, Vertex.Stride, 0);
        gl.vertexAttribPointer(this.firstShader.attribute("normal"), 3, gl.FLOAT, false, Vertex.Stride, 3 * 4);

        gl.enableVertexAttribArray(this.firstShader.attribute("position"));
        gl.enableVertexAttribArray(this.firstShader.attribute("normal"));
                
        this.firstShader.validate();
        //gl.drawElements(gl.TRIANGLES, this.nIndices, gl.UNSIGNED_SHORT, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, this.nVertices);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };    
    
    ThreeD.prototype.secondPass = function(dt) {
        gl.viewport(0, 0, this.width, this.height);
        
        gl.clearColor(0.2, 0.1, 1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        
        
        var shader = this.secondShader;
        
        shader.use();
        
        // Sample the data from VBO on the GPU, not CPU.
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vboUnitFrame);
        gl.vertexAttribPointer(shader.attribute("position"), this._vboUnitFrame.itemSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shader.attribute("position"));
        
        
        for(var i = 0; i < this.textures.length; ++i) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
        }
        
        // G-buffer
        gl.uniform1i(shader.uniform("samplerColor"), 0);
        gl.uniform1i(shader.uniform("samplerPosition"), 1);
        gl.uniform1i(shader.uniform("samplerNormal"), 2);
        gl.uniform1i(shader.uniform("samplerDepth"), 3);
        
        // Lights
        gl.uniform3fv(shader.uniform("lights[0]"), this.lights[0].position._);
        
        // Transformations
        gl.uniformMatrix4fv(shader.uniform("projection"), false, this.cam.projection()._);
        gl.uniformMatrix4fv(shader.uniform("view"), false, this.cam.view()._);
        
        shader.validate();
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vboUnitFrame.numItems);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    
    ThreeD.prototype.update = function(dt) {
        
        this.lights[0].position.y = Math.sin(++this.frame / 10) * 4;
        
        //console.log(this.lights[0].position.y);
        
        this.cam.update(dt);
        
        this.firstPass();
        this.secondPass();
    };
    
    return ThreeD;
});