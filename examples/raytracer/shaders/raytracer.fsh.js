
define(function(require) {
    
    

    return function() {
        /*
        
            precision highp float;

            // Per program uniforms:
            uniform vec2 windowSize;
            uniform vec3 cameraTranslation;
            uniform mat4 cameraRotation;
            uniform vec2 mouse;

            // Received from fragment shader:
            varying vec2 inPosition;

            struct Ray {
                vec3 place;
                vec3 direction;
            };

            bool rayIntersetsTriangle(in Ray ray, in vec3 v0, in vec3 v1, in vec3 v2, out vec3 where, out float depth) {
                vec3 e1 = v1 - v0;
                vec3 e2 = v2 - v0;

                vec3 h  = cross(ray.direction, e2);
            	float a = dot(e1, h);
        
            	if (a > -0.00001 && a < 0.00001) {
            		return true;
                }

            	float f = 1.0 / a;
            	vec3 s  = ray.place - v0;
            	float u = f * dot(s, h);

            	if (u < 0.0 || u > 1.0) {
            		return true;
                }

                vec3 q  = cross(s, e1);
            	float v = f * dot(ray.direction, q);

            	if (v < 0.0 || u + v > 1.0) {
            		return true;
                }

            	// at this stage we can compute t to find out where
            	// the intersection point is on the line
            	depth = f * dot(e2, q);



            	if (depth > 0.00001) {// ray intersection
                    where = ray.place + depth * ray.direction;

                    return false;
                } else {
                    // this means that there is a line intersection
            		// but not a ray intersection
            		return true;
                }
        
            }


            void main(void) {
        
                vec4 finalColor = vec4(0, 0.0, 0.0, 0.5);
        
                // List of triangles
                vec3 data[3];
                data[0] = vec3(0, 0, 0.01);
                data[1] = vec3(0.5, 0.5, 0.01);
                data[2] = vec3(-0.5, 0, 0.01);
        
                // View frustrum distance
                float perspective = 4.0;
        
                Ray ray;
        
                // Camera at origin
                ray.place = vec3(0, 0, 0);
    
                // Offset canvas from the camera (substraction is useless, but here for competeness)
                ray.direction = normalize(vec3(inPosition, ray.place.z + perspective) - ray.place);
    
                // Rotate direction about camera
                ray.direction = (cameraRotation * vec4(ray.direction, 1.0)).xyz;
    
                // Translate the camera
                ray.place -= cameraTranslation;
                
                // Test against the whole world.
                for(int i = 0; i < 3; i += 3) {
                    vec3 a = data[i + 0];
                    vec3 b = data[i + 1];
                    vec3 c = data[i + 2];
        
                    vec3 where;
                    float depth;
        
                    //for(int j = 0; j < 3; ++j) {
                    //    float d = length(vec3(inPosition, 0.0) - data[j]);
                    //    if(d < 0.2) {
                    //        finalColor.r += 0.1;        
                    //    }
                    //}
        
                    // Ray intersection trial
                    if( ! rayIntersetsTriangle(ray, a, b, c, where, depth)) {
                        finalColor.r += 1.0;
                    }        
                }
        
                //float d = length(inPosition - ((mouse-100.0)/100.0));
                
                //finalColor.r += d;
        
                gl_FragColor = finalColor;
            }
        
        */
    };
});