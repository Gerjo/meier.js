define(function(require) {

    var Shader = require("meier/webgl/Shader");
    var V2     = require("meier/math/Vec")(2);
    var V3     = require("meier/math/Vec")(3);
    var Tools  = require("./Tools");
    var Grid   = require("./Grid");
    var Random = require("meier/math/Random");
    
    /// Schematic photon representation.
    var Photon = function(d, p, m) {
        this.direction = d || new V3(0, 0, 0);
        this.position  = p || new V3(0, 0, 0);
        this.meta      = m || new V3(0, 0, 0);
        
        this.toArray = function() {
            return [
                this.direction.x, this.direction.y, this.direction.z,
                this.position.x, this.position.y, this.position.z,
                this.meta.z, this.meta.y, this.meta.z || 0
            ];
        }.bind(this);
    }
    
    // Not so portable? (http://jbuckley.ca/~jon/WebGL/extensions/proposals/WEBGL_fbo_color_attachments/)    
    function PhotonBase(game, photonCount) {
        Random.Seed(42);
        
        this.game         = game || null;
        this.photonCount  = photonCount || 512 * 100; (512 * 512);
        this.outTextures  = [];
        this.inTextures   = [];
        this.photons      = [];
        this.ext          = gl.getExtension("WEBGL_draw_buffers");
        
        var dims         = Tools.BalanceDimensions(this.photonCount);
        this.width       = dims.x;
        this.height      = dims.y;
        
        this.readBuffer  = 0;
        this.writeBuffer = 1;
        
        this._prepareBuffers();
        this._uploadUnitFrame();
        
        this._sceneTexture    = null;
        this._sceneDimensions = null;
        this._iteration       = 0;
        
        this._shader = new Shader("shaders/photon.vsh.glsl", "shaders/photon.fsh.glsl");

    }
    
    PhotonBase.prototype.prepare = function(lights, sceneTexture, sceneDimensions) {
        
        // Texture containing the scene.
        this._sceneTexture    = sceneTexture;
        this._sceneDimensions = sceneDimensions;
        
        this.grid = new Grid();
        
        // Accumulate total energy emitted by light sources
        var totalEngergy = lights.reduce(function(p, l) {return p + l.energy;}, 0);
        
        var positions  = new Float32Array(this.photonCount * 3);
        var directions = new Float32Array(this.photonCount * 3);
        var metas      = new Float32Array(this.photonCount * 3);
        
        for(var i = 0, j = 0, l = 0; i < positions.length; i += 3, ++j) {
            
            // Each light gets a share of photons proportional to its energy.
            if(j > this.photonCount / totalEngergy * lights[l].energy) {
                ++l;
                j = 0;
            }
            
            positions[i + 0] = lights[l].position.x;
            positions[i + 1] = lights[l].position.y;
            positions[i + 2] = lights[l].position.z;
            
            // Random uniform distributed direction
            var direction = new V3(Random(-1, 1, true), Random(-1, 1, true), Random(-1, 1, true)).normalize();
            
            directions[i + 0] = direction.x;
            directions[i + 1] = direction.y;
            directions[i + 2] = direction.z;
            
            metas[i + 0] = 1;  // Alive
            metas[i + 1] = 78; // fluxies
            metas[i + 2] = 0;  // not available for use
        }
        
        this._uploadPhotonTextures(directions, positions, metas);
    };
    
    PhotonBase.prototype._uploadPhotonTextures = function(direction, position, meta) {
        // Upload photon directions
        gl.bindTexture(gl.TEXTURE_2D, this.inTextures[0]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.FLOAT, direction);

        // Upload photon positions
        gl.bindTexture(gl.TEXTURE_2D, this.inTextures[1]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.FLOAT, position);

        // Upload photon meta data
        gl.bindTexture(gl.TEXTURE_2D, this.inTextures[2]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.FLOAT, meta);
   
        // Unbind any global state.
        gl.bindTexture(gl.TEXTURE_2D, null);    
    };
    
    
    PhotonBase.prototype.iterate = function() {
        console.log("Photon iteration [" + this._iteration + "] [" + this.width + "x" + this.height + "]...");
        
        var ext = this.ext;
        gl.viewport(0, 0, this.width, this.height);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        
        // A shader with 8 outputs? sure!
        ext.drawBuffersWEBGL([
          ext.COLOR_ATTACHMENT0_WEBGL,
          ext.COLOR_ATTACHMENT1_WEBGL,
          ext.COLOR_ATTACHMENT2_WEBGL,
          ext.COLOR_ATTACHMENT3_WEBGL,
          ext.COLOR_ATTACHMENT4_WEBGL,
          ext.COLOR_ATTACHMENT5_WEBGL,
          ext.COLOR_ATTACHMENT6_WEBGL,
          ext.COLOR_ATTACHMENT7_WEBGL
        ]);
        
        
        var shader = this._shader.use();
        
        // Enable read buffers (previous photons):
        for(var i = 0; i < 3; ++i) {
            gl.activeTexture(gl.TEXTURE1 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.inTextures[i]);
        }
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._sceneTexture);
        
        gl.uniform1i(shader.uniform("samplerDirection"), 1);
        gl.uniform1i(shader.uniform("samplerPosition"),  2);
        gl.uniform1i(shader.uniform("samplerMeta"),      3);
        gl.uniform1i(shader.uniform("sceneTexture"),     0);
        gl.uniform2f(shader.uniform("sceneTextureSize"), this._sceneDimensions.x, this._sceneDimensions.y);
        gl.uniform2f(shader.uniform("sceneTextureUnit"), 1.0 / this._sceneDimensions.x, 1.0 / this._sceneDimensions.y);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vboUnitFrame);
        gl.vertexAttribPointer(shader.attribute("attribPosition"), this._vboUnitFrame.itemSize, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shader.attribute("attribPosition"));
        
        shader.validate();
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this._vboUnitFrame.numItems);
        
        // Remove from global state
        gl.disableVertexAttribArray(shader.attribute("attribPosition"));
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
////////////////////////////////////////
        
        var directionX = this.getFloats(this.outTextures[0]);
        var directionY = this.getFloats(this.outTextures[1]);
        var directionZ = this.getFloats(this.outTextures[2]);
        var positionX  = this.getFloats(this.outTextures[3]);
        var positionY  = this.getFloats(this.outTextures[4]);
        var positionZ  = this.getFloats(this.outTextures[5]);
        var metaX      = this.getFloats(this.outTextures[6]);
        var metaY      = this.getFloats(this.outTextures[7]);

        var directionTexture = new Float32Array(this.photonCount * 3);
        var positionTexture  = new Float32Array(directionTexture.length);
        var metaTexture      = new Float32Array(directionTexture.length);
        for(var i = 0, j = 0; i < positionX.length; ++i, j += 3) {

            var photon = new Photon(
                    new V3(directionX[i], directionY[i], directionZ[i]), 
                    new V3(positionX[i], positionY[i], positionZ[i]), 
                    new V3(metaX[i], metaY[i], 0)
            );
            
            // Export to textures for the next bounce iteration.
            directionTexture[j + 0] = directionX[i];
            directionTexture[j + 1] = directionY[i];
            directionTexture[j + 2] = directionZ[i];
            positionTexture[j + 0]  = positionX[i];
            positionTexture[j + 1]  = positionY[i];
            positionTexture[j + 2]  = positionZ[i];
            metaTexture[j + 0]      = metaX[i];
            metaTexture[j + 1]      = metaY[i];
            metaTexture[j + 2]      = 0;
            
            // Alive test
            if(parseInt(photon.meta.x) == 1 && this._iteration > 0) {
                this.grid.insert(photon);    
                
                // Assume positive flux
                ASSERT(photon.meta.y >= 0);
            }
        }
        
        this._uploadPhotonTextures(directionTexture, positionTexture, metaTexture);       
        
        // Toggle buffers.
        this.readBuffer  = 1 - this.readBuffer;
        this.writeBuffer = 1 - this.writeBuffer;
        ASSERT(this.readBuffer != this.writeBuffer);
        
        ++this._iteration;
    };
    
    PhotonBase.prototype.getFloats = function(texture) {
        var ext = this.ext;
        
        // Ties all other buffers together.
        var fbo2 = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2);

        // Allocate storage.
        var rbo2 = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbo2);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo2);

        // Attach textures to the (shader) outputs
        gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL, gl.TEXTURE_2D, texture, 0);
    
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(status != gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("Broken photon framebuffer, code: " + status);
        }
        
        var data = new Uint8Array(this.photonCount * 4);
        
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
        
        // delete buffers... or reuse them?
        
        // Performs some sort of JavaScript reinterpret_cast<float>(bytes)
        return new Float32Array(data.buffer);
    };
    
    PhotonBase.prototype.toArray = function() {
        return this.grid.toArray();
    };
    
    PhotonBase.prototype.upload = function(shader) {
        return this.grid.upload(shader);
    };
    
    PhotonBase.prototype.exportToGrid = function(dims) {
        dims = dims || new V3(10, 10, 10);
        
    };
    
    
    PhotonBase.prototype.exportKdTree = function() {
        // As if that worked out.
    };
    
    
    PhotonBase.prototype._prepareBuffers = function() {
        var ext = this.ext;
        
        ASSERT(gl.getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL) >= 8);
        
        console.log("Max color attachments: " + gl.getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL) + "/8");
        
        // Generate output textures
        for(var i = 0; i < 8; ++i) {
            this.outTextures[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.outTextures[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        
        // Generate input textures
        for(var i = 0; i < 3; ++i) {
            this.inTextures[i] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.inTextures[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.FLOAT, null);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        
        
        // Ties all other buffers together.
        var fbo = this.fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        
        // Allocate storage.
        var rbo = this.rbo = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
        
        // Attach textures to the (shader) outputs
        for(var i = 0; i < this.outTextures.length; ++i) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D, this.outTextures[i], 0);
        }
        
        console.log(ext);
            
        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(status != gl.FRAMEBUFFER_COMPLETE) {
            throw new Error("Broken photon framebuffer, code: " + status);
        }
        
        // Unbind from global state.
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };
    
    /// Upload a generic frame that matches the unit screen size.
    /// Method copied from Raytracer.js (contemplate reuse)
    PhotonBase.prototype._uploadUnitFrame = function() {
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
    
    return PhotonBase;
});