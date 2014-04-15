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
    
    
    function Raytracer(container) {        
        this.width       = 500;
        this.height      = 500;
        this.hw          = this.width * 0.5;
        this.hh          = this.height * 0.5;
        this.mouse       = new V2(0, 0);
        this.rotation    = M44.CreateIdentity();
        this.orientation = new V3(0, 0, 0);
        this.translation = new V3(0, 0, 0);
        this.speed       = new V2(1, 0.008); // Move, rotate
        this.sleep       = 100;
        
        container.appendChild(this._canvas = document.createElement("canvas"));
        this._canvas.width  = this.width;
        this._canvas.height = this.height;
        this._canvas.style.marginTop = "-" + this.hh + "px";
        this._canvas.style.marginLeft = "-" + this.hw + "px";
        this._canvas.style.top = "50%";
        this._canvas.style.left = "50%";
        this._canvas.style.position = "absolute";
        
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
        this._vbo.type     = gl.FLOAT; // Data type.
        this._vbo.length   = this._vbo.itemSize * this._vbo.numItems;
        
        
        // Detach VBO from global state.
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        window.onblur = function() {
             this.sleep = 5000;
        }.bind(this);
        
        window.onfocus = function() {
             this.sleep = 100;
        }.bind(this);
        
        container.onmousemove = function(event) {
            var x = event.x - this._canvas.offsetLeft + window.pageXOffset;
            var y = event.y - this._canvas.offsetTop  + window.pageYOffset;
            
            var mouse = new V2(
                x, y
            );
            
            var delta = this.mouse.clone().subtract(mouse);
            
            this.orientation.add(delta.scaleScalar(this.speed.y));
            
            
            this.mouse    = mouse;
            this.rotation = M44.CreateXoZ(this.orientation.x).
                            product(M44.CreateYoZ(-this.orientation.y)).
                                product(M44.CreateXoY(this.orientation.z));
            
            
        }.bind(this);
        
        container.onkeydown = function(event) {
            
            var direction = new V3(0, 0, 0);
            
            // A
            if(event.keyCode == 65) {
                //this.rotation = this.rotation.product( M44.CreateEulerAngles(0.1, 0.0, 0.0) );
                
                direction.x += this.speed.x;
                
            // D
            } else if(event.keyCode == 68) {
                
                direction.x -= this.speed.x;
                
            // W
            } else if(event.keyCode == 87) {
                direction.z -= this.speed.x;
            // S  
            } else if(event.keyCode == 83) {
                direction.z += this.speed.x;
            }
            
            this.translation.add(this.rotation.transform(direction));
            
            //console.log(this.rotation.pretty(), this.translation.wolfram());
            
        }.bind(this);
        
        // Commence render loop!
        this.render();
    }
    
    Raytracer.prototype.render = function() {
        
        //console.log("Rendering... [" + (this.mouse.x) + ", " + (this.mouse.y) + "]");
        
        var shader = this.shader.use();
        
        // Upload uniforms
        gl.uniform2f(shader.uniform("windowSize"), this._width, this._height);
        gl.uniform3fv(shader.uniform("cameraTranslation"), this.translation._);
        gl.uniform2f(shader.uniform("mouse"), this.mouse.x, this.mouse.y);
        
        gl.uniformMatrix4fv(shader.uniform("cameraRotation"), false, this.rotation.transpose()._);
        

        // Sample the data from VBO on the GPU, not CPU.
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vbo);
        gl.vertexAttribPointer(
            shader.attribute("attribPosition"),    // Attribute location
            this._vbo.itemSize,                     // Number of items
            this._vbo.type,                         // Numeric type
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
        gl.flush();
        
        //console.log("draws");
        
        setTimeout(this.render.bind(this), this.sleep);
    }
    
    return Raytracer;
});