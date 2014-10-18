define(function(require) {
    return {
        File: function(url) {
            var http = new XMLHttpRequest();
    
            http.open('GET', url, false); // Synchronized & blocking
            http.send(null);

            if(http.status != 200) {
                return null;
            }

            if(http.readyState === 4) {
                return http.responseText;
            }
        },
        
        Bytes: function(url, callback) {
            
            if(typeof callback != "function") {
                throw new Error("No callback specified.");
            }
            
            var http = new XMLHttpRequest();
            http.responseType = "arraybuffer";
            http.open('GET', "./rhythmic.wav", true);
        
            http.onload = function(oEvent) {
                
                if(http.status != 200) {
                    callback(null);
                }
                
                var data = new Uint8Array(http.response);
            
                callback(data);
            };
        
            http.send(null);
        }
    };
});