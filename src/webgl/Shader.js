define(function(require) {
    
    function ReadFile(url) {
    
        var http = new XMLHttpRequest();
        http.open('GET', url, false); // Synchronized
        http.send(null);

        if(http.status != 200) {
            return null;
        }

        if(http.readyState === 4) {
            return http.responseText;
        }
  
        return null;
    }
    
    function PreProcess(url) {
        var source = ReadFile(url);
        
        if(source == null) {
            throw new Error("Shader preprocessor error. Cannot read file: " + url);
        }
        
        var regex = "";
        
        return source.replace(/#include \"(.+)\"/, function(wholematch, file) {
            return PreProcess(file);
        });
        
    }
    
    function Shader(vertexUrl, fragmentUrl) {
        
        
        
        // Uniform lookup table.
        this._uniforms = {};
        
        // Attribute lookup table.
        this._attributes = {};


        // Shader program container
        var program = this._program = gl.createProgram();
     
        var shaders = [
            { type: gl.VERTEX_SHADER,   url: vertexUrl,   handle: null, src: null },
            { type: gl.FRAGMENT_SHADER, url: fragmentUrl, handle: null, src: null }
        ];
     
        shaders.forEach(function(details) {
            console.log("Attemping to compile: ", details.url);
            
            details.src = PreProcess(details.url);
            
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