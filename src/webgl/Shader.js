define(function(require) {
    
    function Shader(vertexSrc, fragmentSrc) {
        
        // Uniform lookup table.
        this._uniforms = {};
        
        // Attribute lookup table.
        this._attributes = {};

        // TODO: this is clearly not how things work.
        function hereDoc(f) {
            return f.toString().replace(/^[^\/]+\/\*!?/, '').replace(/\*\/[^\/]+$/, '');
        }
        
        // Shader program container
        var program = this._program = gl.createProgram();
     
        var shaders = [
            { type: gl.VERTEX_SHADER,   src: hereDoc(vertexSrc),   handle: null },
            { type: gl.FRAGMENT_SHADER, src: hereDoc(fragmentSrc), handle: null }
        ];
     
        shaders.forEach(function(details) {
            console.log("Attemping to compile: ", details.type);
            
            // Create a shader handle to work with
            details.handle = gl.createShader(details.type);
            
            gl.shaderSource(details.handle, details.src);
            gl.compileShader(details.handle);
            
            if( ! gl.getShaderParameter(details.handle, gl.COMPILE_STATUS)) {
                var error = gl.getShaderInfoLog(details.handle);
                
                console.log(error);
            }
            
            // Attach to the program
            gl.attachShader(program, details.handle);
        });
     
        gl.linkProgram(program);
        
        // Detach the shaders. OpenGL does internal reference counting and won't 
        // dispose the shaders until the program is deleted, too.
        shaders.forEach(function(details) {
            gl.deleteShader(details.handle);
        });
        
        if( ! gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log("Could not initialize shaders");
        }   
    }
    
    Shader.prototype.validate = function() {
        gl.validateProgram(this._program);
        if( ! gl.getProgramParameter(this._program, gl.VALIDATE_STATUS)) {
            console.log(gl.getProgramInfoLog(this._program));            
        }
        
        return this;
    }
    
    Shader.prototype.use = function() {
        gl.useProgram(this._program);
        
        return this;
    };
    
    Shader.prototype.uniform = function(key) {
        if( ! this._uniforms[key] ) {
            this._uniforms[key] = gl.getUniformLocation(this._program, key);
        }
        
        return this._uniforms[key];
    };
    
    Shader.prototype.attribute = function(key) {
        
        // This has the falsey-bug
        if( ! this._attributes[key] ) {
            this._attributes[key] = gl.getAttribLocation(this._program, key);
        }
        
        //console.log(key, this._attributes[key]);
        
        return this._attributes[key];
    };
    
    
    return Shader;
});