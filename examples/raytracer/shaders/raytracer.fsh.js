
define(function(require) {
    
    

    return function() {
        /*
        
            precision highp float;

            // Per program uniforms:
            uniform vec2 windowSize;            // The viewport size.
            uniform vec3 cameraTranslation;     // Translation vector.
            uniform mat4 cameraRotation;        // Rotation matrix.
            uniform vec2 mouse;                 // For debug purposes.
            uniform sampler2D sceneTexture;     // Sampler width scene data.
            uniform vec2 sceneTextureSize;      // Dimensions in scene texture.
            uniform vec2 sceneTextureUnit;      // Scale pixel positions to UV scale.
            uniform int numObjects;             // Amount of objects in scene texture.

            // Received from fragment shader:
            varying vec2 inPosition;

            struct Ray {
                vec3 place;
                vec3 direction;
            };
        
            /// Integer modulo.
            int mod(in int i, in int n) {
                return i - i / n * n;
            }

            /// Number rounding
            int round(in float f) {
                return int(floor(f + 0.5));
            }

            /// Hit testing        
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

            /// Shader entry point
            void main(void) {
        
                // Default pixel color
                vec4 finalColor = vec4(0.5, 0.5, 0.5, 1);
                
                // List of debug colors
                vec4 colors[10];
                colors[0] = vec4(0.33, 0.48, 0.96, 1.0);
                colors[1] = vec4(0.03, 0.05, 0.85, 1.0);
                colors[2] = vec4(0.34, 0.71, 0.64, 1.0);
                colors[3] = vec4(0.28, 0.95, 0.40, 1.0);
                colors[4] = vec4(0.07, 0.70, 0.57, 1.0);
                colors[5] = vec4(0.26, 0.74, 0.26, 1.0);
                colors[6] = vec4(0.45, 0.06, 0.03, 1.0);
                colors[7] = vec4(0.76, 0.78, 0.63, 1.0);
                colors[8] = vec4(0.33, 0.87, 0.87, 1.0);
                colors[9] = vec4(0.42, 0.30, 0.12, 1.0);
                
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
                
                // Properties of the nearest intersection.
                bool hasNearest = false;
                vec3 nearestPosition;
                vec3 nearestNormal;
                vec4 nearestColor;
                float nearestDepth = 999999999.0;
        
                const int triangleStride = 4;
                
                // Test against the whole world.
                for(int i = 0; i < 152; i += triangleStride) {
            
                    float o = float(i);
        
                    // In nearest neighour we trust.
                    vec3 a  = texture2D(sceneTexture, vec2(o + 1.0, 0) * sceneTextureUnit).xyz;
                    vec3 b  = texture2D(sceneTexture, vec2(o + 2.0, 0) * sceneTextureUnit).xyz;
                    vec3 c  = texture2D(sceneTexture, vec2(o + 3.0, 0) * sceneTextureUnit).xyz;
        
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
            
                        // Only keep the nearest object
                        if(nearestDepth > depth) {
                            nearestDepth    = depth;
                            nearestPosition = where;
                            nearestNormal   = cross(b - a, c - a);
                            hasNearest      = true;
                            nearestColor    = colors[mod(i, 10)];
                        }
        
                        //finalColor.r += 1.0;
                    }        
                }

                // Hardcoded light source
                vec3 light = vec3(-2.22, -2.444, 0.75);
        
                // If the ray hit something, apply lighting.
                if(hasNearest) {
                    vec3 lightDir = normalize(light - nearestPosition);
                    float lambert = max(dot(lightDir, nearestNormal), 0.0);
        
                    finalColor = nearestColor;
                    finalColor += lambert;
                }
        
                gl_FragColor = finalColor;
            }
        
        */
    };
});