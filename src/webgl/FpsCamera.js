define(function(require) {
    var Input = require("meier/engine/Input");
    var Key   = require("meier/engine/Key");

    var V4       = require("meier/math/Vec")(4);
    var V3       = require("meier/math/Vec")(3);
    var V2       = require("meier/math/Vec")(2);
    var Matrix33 = require("meier/math/Mat")(3, 3);
    var Matrix44 = require("meier/math/Mat")(4, 4);
    
    function Camera(game) {
        this.game = game;
        this.input = game.input;
    
        this.mouse = null;
        
        this.position    = new V3(0, 0, 0);
        this.orientation = new V3(0, 0, 0);
        
        this.moveSpeed  = 2.3;
        this.mouseSpeed = 0.007;
        this.rollSpeed  = 0.04;
    
        this.locked     = false;
    }
    
    
    Camera.prototype.model = function() {
        return Matrix44.CreateIdentity();
    };
    
    Camera.prototype.view = function() {
        
        var translation = Matrix44.CreateTranslation(this.position);
        var rotation = this.computeRotation();
        
        return rotation.product(translation).transpose();
    };
    
    Camera.prototype.projection = function() {
        
        var perspective = Matrix44.CreatePerspectiveProjection(
            3.14159268/2.5, 
            this.game.width / this.game.height, 
            0.01, 
            200.0);



        //var matrix = perspective.product(rotation.product(translation)).transpose();
        
        return perspective.transpose();
    };
    
    Camera.prototype.update = function(dt) {
        
        this.game.log("Orientation", this.orientation.x.toFixed(2) + ", " + this.orientation.y.toFixed(2) + ", " + this.orientation.z.toFixed(2));
        this.game.log("Position", this.position.x.toFixed(2) + ", " + this.position.y.toFixed(2) + ", " + this.position.z.toFixed(2));
        
        var input = this.input;
        
        
        var movement = new V4(
            input.isKeyDown(Key.A) - input.isKeyDown(Key.D),
            input.isKeyDown(Key.Q) - input.isKeyDown(Key.E),
            input.isKeyDown(Key.W) - input.isKeyDown(Key.S),
            1
        );
        
        
        var r = this.computeInverseRotation();
        
        
        this.position.addScaled(r.transform(movement), this.moveSpeed);
        //this.position.addScaled(movement, 0.02);
        
        if(this.mouse) {
            var delta  = new V3(this.input.x - this.mouse.x, this.input.y - this.mouse.y, 0);
        
            if( ! delta.isNull()) {
                
                var rollCompensation = Matrix33.CreateXoY(this.orientation.z);
                
                //console.log(this.orientation.pretty() + "->\n" + rollCompensation.pretty());
                
                this.orientation.addScaled(rollCompensation.transform(delta), 0.006);
                //this.orientation.addScaled(delta, 0.006);
            }
        
            this.mouse = this.input.clone();
        } else if(this.input.magnitude() < 20) {
            this.mouse = this.input.clone();
        }
        
        
        
    };
    
    Camera.prototype.computeInverseRotation = function() {
        var _rotateX = Matrix44.CreateYoZ( 1 * this.orientation.y);
        var _rotateY = Matrix44.CreateXoZ(-1 * this.orientation.x);
        var _roll    = Matrix44.CreateXoY(-1 * this.orientation.z);
        
        return _rotateY.product(_rotateX).product(_roll);
    };
    
    Camera.prototype.computeRotation = function() {
        var _rotateX = Matrix44.CreateYoZ(-1 * this.orientation.y);
        var _rotateY = Matrix44.CreateXoZ( 1 * this.orientation.x);
        var _roll    = Matrix44.CreateXoY( 1 * this.orientation.z);
        
        return _roll.product(_rotateX).product(_rotateY);
        return _rotateY.product(_rotateX).product(_roll);
    };
    
    return Camera;
});