define(function(require) {
    return {
        File: function(url) {
            UNTESTED("Read.File");
			
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
            UNTESTED("Read.Bytes");
            if(typeof callback != "function") {
                throw new Error("No callback specified.");
            }
            
            var http = new XMLHttpRequest();
            http.responseType = "arraybuffer";
            http.open("GET", url, true);
        
            http.onload = function(oEvent) {
                
                if(http.status != 200) {
                    callback(null);
                }
                
                var data = new Uint8Array(http.response);
            
                callback(data);
            };
        
            http.send(null);
        },
		
		Json: function(url, callback) {
            var http = new XMLHttpRequest();
            http.open('GET', url, true);
        
            http.onload = function(oEvent) {
                
                if(http.status != 200) {
                    callback(null);
                }
                
				var json = JSON.TryParse(http.response);
				
                callback(json);
            };
        
            http.send(null);
		},
		
		Post: function(url, object, callback) {
			var http = new XMLHttpRequest();   // new HttpRequest instance 
			http.open("POST", url);
			http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			
            http.onload = function(oEvent) {
                
                if(http.status != 200) {
                    callback(null);
                }
                
                callback(JSON.TryParse(http.response));
            };
			
			http.send(JSON.stringify(object));			
		},
    };
});