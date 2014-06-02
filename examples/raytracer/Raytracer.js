/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2014 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/

/// Global OpenGL object. No shame in this. OpenGL has global state anyway.
var gl = null;

/// Testbed for evaluating WebGL. What beter than writing a GLSL based 
/// raytracer. (major bad idea right there)
///
define(function(require){
    var Game  = require("meier/engine/Game");
    var Input = require("meier/engine/Input");
    var Keys  = require("meier/engine/Key");
    var Shader = require("meier/webgl/Shader");
    var V2     = require("meier/math/Vec")(2);
    var V3     = require("meier/math/Vec")(3);

    var Camera = require("./Camera");
    var Tools  = require("./Tools");
    
    var PhotonBase  = require("./PhotonBase");
    var Light       = require("./Light");
    
    
    //var M     = require("meier/math/Math");
    
    Raytracer.prototype = new Game();
    function Raytracer(container) {  
        Game.call(this, container);
        
        this.setHighFps(15);
        this.setLowFps(1);
        this.logger.setColor("red");
        
        this.photonTexture    = null;
        this.sceneTexture     = null;
        this.sceneDimensions  = null;
        this.scene            = require("./Scene");
        this.frameCounter     = 0;
        this.interlacing      = 6; // Interlacing constant
        this.viewport         = new V2(this.width, this.height);
        this.add(this.camera  = new Camera());

        
        // Add a second canvas, only one context can be created per canvas.
        container.appendChild(this._canvas = document.createElement("canvas"));
        // Intentionally setting a global state.
        gl = this._canvas.getContext("experimental-webgl");
        
        // Center GL view on screen.
        this._canvas.width            = this.viewport.x;
        this._canvas.height           = this.viewport.y;
        this._canvas.style.marginLeft = "-" + (this.viewport.x * 0.5) + "px";
        this._canvas.style.marginTop  = "-" + (this.viewport.y * 0.5) + "px";
        this._canvas.style.top        = "50%";
        this._canvas.style.left       = "50%";
        this._canvas.style.position   = "absolute";
        this._canvas.style.zIndex     = -2;
        
        // We run our own stuff, inform GL to not even bother.
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        
        // Raytracer program
        this.tracerProgram = new Shader("./shaders/raytracer.vsh.glsl", "./shaders/raytracer.fsh.glsl");
        this.imageProgram  = new Shader("./shaders/image.vsh.glsl", "./shaders/image.fsh.glsl");
        
        // OpenGL preperations
        this.prepareInterlacing();
        this.uploadUnitFrame();
        this.uploadScene();
        
        var lights = [
            new Light(new V3(-2.22, -2.444, 0.75)),
            // new Light(),
            // new Light(),
            // new Light(),
        ];
        
        this.photonBase = new PhotonBase(this);
        
        this.photonBase.prepare(lights, this.sceneTexture, this.sceneDimensions);
        
        this.photonBase.iterate();
        this.photonBase.iterate();
        this.photonBase.iterate();
        //this.photonBase.iterate();
        //this.photonBase.iterate();
        
        // Upload the grid texture and set the required uniform constants
        this.photonTexture = this.photonBase.upload(this.tracerProgram);
    }
    
    Raytracer.prototype.prepareInterlacing = function() {
        var fbo = this._interlacingFbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

        // Prepare target texture
        var texture = this._interlacingTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.viewport.x, this.viewport.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    
        // Render buffer object, storage stuff.
        var rbo = this._interlacingRbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.viewport.x, this.viewport.y);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
        
        // Unbind from global state.
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    
    /// Upload a generic frame that matches the unit screen size.
    Raytracer.prototype.uploadUnitFrame = function() {
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
    
    Raytracer.prototype.uploadScene = function(event) {
        
        
        if( ! gl.getExtension('OES_texture_float')) {
            throw new Error("OES_texture_float not available.");
        } 
        
        var texmax = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        var pixels = this.scene.length / 3; // Scale to float RGB triplets
        var size   = Tools.BalanceDimensions(pixels);
        
        
        console.log("Uploading scene [" + size.x + "x" + size.y + " = " + pixels + "] pixels. Maximum: " + texmax + "x" + texmax + ".");
        
        ASSERT(size.x < texmax && size.y < texmax);
        ASSERT(size.x * size.y == pixels);
        
        this.sceneDimensions = size;
        
        // Upload to the GPU.
        var texture = this.sceneTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, size.x, size.y, 0, gl.RGB, gl.FLOAT, this.scene);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        // Update shader uniforms
        this.tracerProgram.use();
        gl.uniform2f(this.tracerProgram.uniform("sceneTextureSize"), size.x, size.y);
        gl.uniform2f(this.tracerProgram.uniform("sceneTextureUnit"), 1.0 / size.x, 1.0 / size.y);
    };
    
    /// Draw anything that requires drawing.
    Raytracer.prototype.draw = function(renderer2d) {        
        Game.prototype.draw.call(this, renderer2d);
        
        
        //return;
        
        // Clean buffers.
        //gl.clearColor(0.0, 0.0, 0.5, 1.0);
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._interlacingFbo);
        this.runRaytracer();        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
  
        this.renderTexture(this._interlacingTexture);
        
        gl.flush();
    }
    
    /// Run the raytracer program
    Raytracer.prototype.runRaytracer = function(renderer2d) {
        
        this.log("Interlacing", "level " + this.interlacing);
        
        // Enable program and retrieve a shorthand varible.
        var shader = this.tracerProgram.use();

        gl.viewport(0, 0, this.viewport.x, this.viewport.y);
        
        // Enable scene data texture. (Always on sampler slot #0)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
        gl.uniform1i(shader.uniform("sceneTexture"), 0);
        
        
        // Enable photon data texture. (Always on sampler slot #1)
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.photonTexture);
        gl.uniform1i(shader.uniform("photonTexture"), 1);
        
        // Upload uniforms
        gl.uniform2f(shader.uniform("windowSize"), this.width, this.height);
        gl.uniform3fv(shader.uniform("cameraTranslation"), this.camera.translation._);
        gl.uniform2f(shader.uniform("mouse"), this.input.x, this.input.y);
        gl.uniform1i(shader.uniform("frameCounter"), ++this.frameCounter);
        gl.uniform1i(shader.uniform("interlacing"), this.interlacing);
        gl.uniformMatrix4fv(shader.uniform("cameraRotation"), false, this.camera.rotation.transpose()._);
        
        // Sample the data from VBO on the GPU, not CPU.
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vboUnitFrame);
        gl.vertexAttribPointer(shader.attribute("attribPosition"), this._vboUnitFrame.itemSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shader.attribute("attribPosition"));
        
        this.tracerProgram.validate();
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vboUnitFrame.numItems);
        
        // Remove from global state
        gl.disableVertexAttribArray(shader.attribute("attribPosition"));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    
    /// Generic program to draw any given texture fullscreen
    Raytracer.prototype.renderTexture = function(texture) {
        var shader = this.imageProgram.use();
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(shader.uniform("sampler"), 0);
        
        
        // Sample the data from VBO on the GPU, not CPU.
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vboUnitFrame);
        gl.vertexAttribPointer(shader.attribute("attribPosition"), this._vboUnitFrame.itemSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shader.attribute("attribPosition"));
        this.imageProgram.validate();
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vboUnitFrame.numItems);
        gl.disableVertexAttribArray(shader.attribute("attribPosition"));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
    };

    return Raytracer;
});