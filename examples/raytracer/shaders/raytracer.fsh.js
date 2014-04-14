
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
        
            /// Integer modulo.
            int mod(in int i, in int n) {
                return i - i / n * n;
            }

            /// Number rounding
            int round(in float f) {
                return int(floor(f + 0.5));
            }
        

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
        
                vec4 finalColor = vec4(0.5, 0.5, 0.5, 1);
        
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
                
                // List of triangles
                vec3 data[114];
                data[0] = vec3(20.000, 20.000, -20.000);
                data[1] = vec3(20.000, -20.000, -20.000);
                data[2] = vec3(-20.000, 20.000, -20.000);
                data[3] = vec3(20.000, 20.000, 20.000);
                data[4] = vec3(-20.000, 20.000, 20.000);
                data[5] = vec3(20.000, -20.000, 20.000);
                data[6] = vec3(20.000, 20.000, -20.000);
                data[7] = vec3(20.000, 20.000, 20.000);
                data[8] = vec3(20.000, -20.000, -20.000);
                data[9] = vec3(20.000, -20.000, -20.000);
                data[10] = vec3(20.000, -20.000, 20.000);
                data[11] = vec3(-20.000, -20.000, -20.000);
                data[12] = vec3(-20.000, -20.000, -20.000);
                data[13] = vec3(-20.000, -20.000, 20.000);
                data[14] = vec3(-20.000, 20.000, -20.000);
                data[15] = vec3(20.000, 20.000, 20.000);
                data[16] = vec3(20.000, 20.000, -20.000);
                data[17] = vec3(-20.000, 20.000, 20.000);
                data[18] = vec3(20.000, -20.000, -20.000);
                data[19] = vec3(-20.000, -20.000, -20.000);
                data[20] = vec3(-20.000, 20.000, -20.000);
                data[21] = vec3(-20.000, 20.000, 20.000);
                data[22] = vec3(-20.000, -20.000, 20.000);
                data[23] = vec3(20.000, -20.000, 20.000);
                data[24] = vec3(20.000, 20.000, 20.000);
                data[25] = vec3(20.000, -20.000, 20.000);
                data[26] = vec3(20.000, -20.000, -20.000);
                data[27] = vec3(20.000, -20.000, 20.000);
                data[28] = vec3(-20.000, -20.000, 20.000);
                data[29] = vec3(-20.000, -20.000, -20.000);
                data[30] = vec3(-20.000, -20.000, 20.000);
                data[31] = vec3(-20.000, 20.000, 20.000);
                data[32] = vec3(-20.000, 20.000, -20.000);
                data[33] = vec3(20.000, 20.000, -20.000);
                data[34] = vec3(-20.000, 20.000, -20.000);
                data[35] = vec3(-20.000, 20.000, 20.000);
                data[36] = vec3(1.000, 1.000, -1.000);
                data[37] = vec3(1.000, -1.000, -1.000);
                data[38] = vec3(-1.000, 1.000, -1.000);
                data[39] = vec3(1.000, 1.000, 1.000);
                data[40] = vec3(-1.000, 1.000, 1.000);
                data[41] = vec3(1.000, -1.000, 1.000);
                data[42] = vec3(1.000, 1.000, -1.000);
                data[43] = vec3(1.000, 1.000, 1.000);
                data[44] = vec3(1.000, -1.000, -1.000);
                data[45] = vec3(1.000, -1.000, -1.000);
                data[46] = vec3(1.000, -1.000, 1.000);
                data[47] = vec3(-1.000, -1.000, -1.000);
                data[48] = vec3(-1.000, -1.000, -1.000);
                data[49] = vec3(-1.000, -1.000, 1.000);
                data[50] = vec3(-1.000, 1.000, -1.000);
                data[51] = vec3(1.000, 1.000, 1.000);
                data[52] = vec3(1.000, 1.000, -1.000);
                data[53] = vec3(-1.000, 1.000, 1.000);
                data[54] = vec3(1.000, -1.000, -1.000);
                data[55] = vec3(-1.000, -1.000, -1.000);
                data[56] = vec3(-1.000, 1.000, -1.000);
                data[57] = vec3(-1.000, 1.000, 1.000);
                data[58] = vec3(-1.000, -1.000, 1.000);
                data[59] = vec3(1.000, -1.000, 1.000);
                data[60] = vec3(1.000, 1.000, 1.000);
                data[61] = vec3(1.000, -1.000, 1.000);
                data[62] = vec3(1.000, -1.000, -1.000);
                data[63] = vec3(1.000, -1.000, 1.000);
                data[64] = vec3(-1.000, -1.000, 1.000);
                data[65] = vec3(-1.000, -1.000, -1.000);
                data[66] = vec3(-1.000, -1.000, 1.000);
                data[67] = vec3(-1.000, 1.000, 1.000);
                data[68] = vec3(-1.000, 1.000, -1.000);
                data[69] = vec3(1.000, 1.000, -1.000);
                data[70] = vec3(-1.000, 1.000, -1.000);
                data[71] = vec3(-1.000, 1.000, 1.000);
                data[72] = vec3(-5.532, 1.644, -5.112);
                data[73] = vec3(-4.888, 0.532, -6.644);
                data[74] = vec3(-6.644, 0.112, -4.468);
                data[75] = vec3(-4.000, 1.000, -4.000);
                data[76] = vec3(-5.112, -0.532, -3.356);
                data[77] = vec3(-3.356, -0.112, -5.532);
                data[78] = vec3(-5.532, 1.644, -5.112);
                data[79] = vec3(-4.000, 1.000, -4.000);
                data[80] = vec3(-4.888, 0.532, -6.644);
                data[81] = vec3(-4.888, 0.532, -6.644);
                data[82] = vec3(-3.356, -0.112, -5.532);
                data[83] = vec3(-6.000, -1.000, -6.000);
                data[84] = vec3(-6.000, -1.000, -6.000);
                data[85] = vec3(-4.468, -1.644, -4.888);
                data[86] = vec3(-6.644, 0.112, -4.468);
                data[87] = vec3(-4.000, 1.000, -4.000);
                data[88] = vec3(-5.532, 1.644, -5.112);
                data[89] = vec3(-5.112, -0.532, -3.356);
                data[90] = vec3(-4.888, 0.532, -6.644);
                data[91] = vec3(-6.000, -1.000, -6.000);
                data[92] = vec3(-6.644, 0.112, -4.468);
                data[93] = vec3(-5.112, -0.532, -3.356);
                data[94] = vec3(-4.468, -1.644, -4.888);
                data[95] = vec3(-3.356, -0.112, -5.532);
                data[96] = vec3(-4.000, 1.000, -4.000);
                data[97] = vec3(-3.356, -0.112, -5.532);
                data[98] = vec3(-4.888, 0.532, -6.644);
                data[99] = vec3(-3.356, -0.112, -5.532);
                data[100] = vec3(-4.468, -1.644, -4.888);
                data[101] = vec3(-6.000, -1.000, -6.000);
                data[102] = vec3(-4.468, -1.644, -4.888);
                data[103] = vec3(-5.112, -0.532, -3.356);
                data[104] = vec3(-6.644, 0.112, -4.468);
                data[105] = vec3(-5.532, 1.644, -5.112);
                data[106] = vec3(-6.644, 0.112, -4.468);
                data[107] = vec3(-5.112, -0.532, -3.356);
                data[108] = vec3(-0.936, -5.289, -1.775);
                data[109] = vec3(3.514, 0.840, -4.353);
                data[110] = vec3(-3.514, -0.840, 4.353);
                data[111] = vec3(3.514, 0.840, -4.353);
                data[112] = vec3(0.936, 5.289, 1.775);
                data[113] = vec3(-3.514, -0.840, 4.353);
        
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
                
                
                
                bool hasNearest = false;
                vec3 nearestPosition;
                vec3 nearestNormal;
                vec4 nearestColor;
                float nearestDepth = 999999999.0;
                
                // Test against the whole world.
                for(int i = 0; i < 113; i += 3) {
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
                vec3 light = vec3(0.0, 0.0, 0.0);
        
                if(hasNearest) {
                    vec3 lightDir = normalize(light - nearestPosition);
                    float lambert = max(dot(lightDir, nearestNormal), 0.0);
        
                    finalColor = nearestColor;
                    finalColor += lambert;
                }
        
                //float d = length(inPosition - ((mouse-100.0)/100.0));
                
                //finalColor.r += d;
        
                gl_FragColor = finalColor;
            }
        
        */
    };
});