/**
 !* Part of meier.js - a game and math prototype library.
 !*  Copyright (C) 2013 Gerard J. Meier <gerjoo@gmail.com>
 !*
 !*
 !*/


define(function(require) {
   
   
   
    Key._lookup       = [];
    Key._lookupString = [];
    Key.fromCode = function(code) {
        
        // Known key, return it right away:
        if(Key._lookup[code]) {
            return Key._lookup[code];
        }
        
        // Create a new "unkown" key:
        return MakeKey(code);
    }
    
    function Key(code, name) {
        this.code  = code;
        this._name = name || ("unknown_" + code);
    }
    
    // A unique representation of this object.
    Key.prototype.toString = function() {
        return "Key [" + this.code + "]:" + this._name;
    };
    
    // Macro to make keys:
    function MakeKey(code, name) {
        Key[name]         = new Key(code, name);
        Key._lookup[code] = Key[name];
        
        Key._lookupString[Key[name]] = Key[name];
        
        return Key[name];
    }
        
    // Mapped using an apple US style keyboard.
    MakeKey(65, "A");
    MakeKey(66, "B");
    MakeKey(67, "C");
    MakeKey(68, "D");
    MakeKey(69, "E");
    MakeKey(70, "F");
    MakeKey(71, "G");
    MakeKey(72, "H");
    MakeKey(73, "I");
    MakeKey(74, "J");
    MakeKey(75, "K");
    MakeKey(76, "L");
    MakeKey(77, "M");
    MakeKey(78, "N");
    MakeKey(79, "O");
    MakeKey(80, "P");
    MakeKey(81, "Q");
    MakeKey(82, "R");
    MakeKey(83, "S");
    MakeKey(84, "T");
    MakeKey(85, "U");
    MakeKey(86, "V");
    MakeKey(87, "W");
    MakeKey(88, "X");
    MakeKey(89, "Y");
    MakeKey(90, "Z");
    
    MakeKey(32, "SPACE");
    
    MakeKey(48, "ZERO");
    MakeKey(49, "ONE");
    MakeKey(50, "TWO");
    MakeKey(51, "THREE");
    MakeKey(52, "FOUR");
    MakeKey(53, "FIVE");
    MakeKey(54, "SIX");
    MakeKey(55, "SEVEN");
    MakeKey(56, "EIGHT");
    MakeKey(57, "NINE");
   
    MakeKey(13, "LEFT_ENTER");
    
    MakeKey(38, "UP");
    MakeKey(40, "DOWN");
    MakeKey(37, "LEFT");
    MakeKey(39, "RIGHT");
    
    MakeKey(189, "MINUS");
    MakeKey(187, "PLUS");

    MakeKey(16, "SHIFT");
    MakeKey(18, "ALT");

    MakeKey(91, "LEFT_COMMAND");
    MakeKey(93, "RIGHT_COMMAND");

	// apparently different per browser.
    //MakeKey(224, "APPLE_KEY");
 
    
    return Key;
});