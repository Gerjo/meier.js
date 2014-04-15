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
    
    var Shader = require("meier/webgl/Shader");
    var V2     = require("meier/math/Vec")(2);
    var V3     = require("meier/math/Vec")(3);
    var M44    = require("meier/math/Mat")(4, 4);
    
    var Primitives = require("./Primitives");
    
    var M    = require("meier/math/Math");
    
    var Game  = require("meier/engine/Game");
    var Input = require("meier/engine/Input");
    var Keys  = require("meier/engine/Key");
    
    Raytracer.prototype = new Game();
    function Raytracer(container) {  
        Game.call(this, container);
    
        this.setHighFps(15);
        this.setLowFps(1);
        this.logger.setColor("red");
        
        this.width        = 800;
        this.height       = 500;
        this.hw           = this.width * 0.5;
        this.hh           = this.height * 0.5;
        this.mouse        = new V2(0, 0);
        this.rotation     = M44.CreateIdentity();
        this.orientation  = new V3(-1.71, 0.07, 0);
        this.translation  = new V3(26, -0.5, -2.1);
        this.speed        = new V2(1, 0.008); // Move, rotate
        this.sceneTexture = null;
        this.frameCounter = 0;
        this.lock         = true;
        this.rotation     = M44.CreateXoZ(-this.orientation.x).product(M44.CreateYoZ(this.orientation.y)).product(M44.CreateXoY(this.orientation.z));
        
        // Add a second canvas, only one context can be created per canvas.
        container.appendChild(this._canvas = document.createElement("canvas"));
        this._canvas.width            = this.width;
        this._canvas.height           = this.height;
        this._canvas.style.marginTop  = "-" + this.hh + "px";
        this._canvas.style.marginLeft = "-" + this.hw + "px";
        this._canvas.style.top        = "50%";
        this._canvas.style.left       = "50%";
        this._canvas.style.position   = "absolute";
        this._canvas.style.zIndex     = -2;
        
        // Intentionally setting a global state.
        gl = this._canvas.getContext("experimental-webgl");
        gl.viewportWidth  = this.width;
        gl.viewportHeight = this.height;
        
        // We run our own stuff, inform GL to not even bother.
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearColor(0.0, 0.0, 0.5, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Raytracer shader, the only shader for now.
        var shader = this.shader = new Shader(
            require("./shaders/raytracer.vsh"),
            require("./shaders/raytracer.fsh")
        );
        
        var vertices = new Float32Array([
               -1, -1,
                1, -1,
               -1,  1,
                1,  1,
        ]);

        // Vertex buffer object to contain the unit rectangle coordinates
        this._vbo = gl.createBuffer();
        
        // Bind global state and upload vertices to the GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        
        this._vbo.itemSize = 2;        // Stride: two floats
        this._vbo.numItems = 4;        // Four in total, a pair at each corner.
        this._vbo.length   = this._vbo.itemSize * this._vbo.numItems;
        
        
        // Detach VBO from global state.
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        this.input.subscribe(Input.MOUSE_MOVE, this.onMouseMove.bind(this));
        
        this.input.subscribe(Input.KEY_DOWN, function(input, key) {
            if(key == Keys.L) {
                this.lock = ! this.lock;
                
                // Copy the mouse location
                this.mouse = input.clone();
            }
        }.bind(this));

        this.uploadScene();
    }
    
    Raytracer.prototype.uploadScene = function(event) {
        
        
        if( ! gl.getExtension('OES_texture_float')) {
            throw new Error("OES_texture_float not available.");
        } 
        
        var scene  = require("./Scene"); //.slice(0, 3);
        var texmax = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        var pixels = scene.length / 3; // Scale to float RGB triplets
        
        
        var primes = M.PrimeFactors(pixels);
        
        var size = new V2(1, 1);
        for(var i = 0; primes.length > 0; i = 1 - i) {
            size._[i] *= primes.pop();
        }
        
        console.log("Scene [" + size.x + "x" + size.y + " = " + pixels + "] pixels. Maximum: " + texmax + "x" + texmax + ".");
        console.log(scene);
        
        ASSERT(size.x < texmax && size.y < texmax);
        ASSERT(size.x * size.y == pixels);
        
        // Upload to the GPU.
        var texture = this.sceneTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, size.x, size.y, 0, gl.RGB, gl.FLOAT, scene);
        gl.bindTexture(gl.TEXTURE_2D, null);
        
        this.shader.use();
        gl.uniform2f(this.shader.uniform("sceneTextureSize"), size.x, size.y);
        gl.uniform2f(this.shader.uniform("sceneTextureUnit"), 1.0 / size.x, 1.0 / size.y);
    };
    
    
    Raytracer.prototype.draw = function(renderer2d) {
        Game.prototype.draw.call(this, renderer2d);
        
        this.handleMovement();
        
        var shader = this.shader.use();
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
        gl.uniform1i(shader.uniform("sceneTexture"), 0);
        gl.uniform1i(shader.uniform("frameCounter"), ++this.frameCounter);
        
        
        // Upload uniforms
        gl.uniform2f(shader.uniform("windowSize"), this.width, this.height);
        gl.uniform3fv(shader.uniform("cameraTranslation"), this.translation._);
        gl.uniform2f(shader.uniform("mouse"), this.mouse.x, this.mouse.y);
        
        gl.uniformMatrix4fv(shader.uniform("cameraRotation"), false, this.rotation.transpose()._);
        
        // Sample the data from VBO on the GPU, not CPU.
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.vertexAttribPointer(
            shader.attribute("attribPosition"),     // Attribute location
            this._vbo.itemSize,                     // Number of items
            gl.FLOAT,                               // Numeric type
            false,                                  // Normalize?
            0,                                      // Stride
            0                                       // Offset (for non VBO purposes)
        );
        
        // Enable global attribute state
        gl.enableVertexAttribArray(shader.attribute("attribPosition"));
        
        this.shader.validate();
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vbo.numItems);
        
        // Remove from global state
        gl.disableVertexAttribArray(shader.attribute("attribPosition"));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        // Force execution of gl calls. (note sure if required?)
        //gl.flush();
        
        //console.log("draws");  
        
        this.log("Orientation", this.orientation.x.toFixed(2) + ", " + this.orientation.y.toFixed(2) + ", " + this.orientation.z.toFixed(2));      
        this.log("Translation", this.translation.x.toFixed(2) + ", " + this.translation.y.toFixed(2) + ", " + this.translation.z.toFixed(2));      
    }

    
    /// Camera code
    Raytracer.prototype.handleMovement = function() {
        
        var direction = new V3(0, 0, 0);
    
        if(this.input.isKeyDown(Keys.A)) {
            direction.x += this.speed.x;
        }
        if(this.input.isKeyDown(Keys.D)) {
            direction.x -= this.speed.x;
        } 
        if(this.input.isKeyDown(Keys.W)) {
            direction.z -= this.speed.x;
        } 
        if(this.input.isKeyDown(Keys.S)) {
            direction.z += this.speed.x;
        }
    
        this.translation.add(this.rotation.transform(direction));
    };
    
    /// Camera code
    Raytracer.prototype.onMouseMove = function(mouse) {
        if( ! this.lock) {
            var delta = this.mouse.clone().subtract(mouse);
        
            //delta.clamp(-5, 5);
        
            //console.log(delta.pretty());
        
            if(this.mouse.x != 0 && this.mouse.x != 0) {
                this.orientation.add(delta.scaleScalar(this.speed.y));
            }
        
            this.mouse    = mouse.clone();
            this.rotation = M44.CreateXoZ(-this.orientation.x).
                            product(M44.CreateYoZ(this.orientation.y)).
                                product(M44.CreateXoY(this.orientation.z));
        }
    };
    
    return Raytracer;
});