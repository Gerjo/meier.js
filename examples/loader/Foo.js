define(function (require) {

    var f = require("./bar");


    f.a();
    f.b();

    function Hello() {
        console.log("HELLLOOOOW");
    }

    
    return Hello;
});