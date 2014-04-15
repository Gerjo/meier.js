
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
    uniform int frameCounter;           // Frame counter.

    // Received from fragment shader:
    varying vec2 inPosition;


    // One stride to rule them all.
    const int objectStride = 10;
    const int sceneTextureCount = 380;

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

    vec2 indexWrap(in int index, in float width) {
        float fIndex = float(index);

        vec2 texIndex = vec2(0.0, int(fIndex / width));
        texIndex.x = fIndex - texIndex.y * width;

        return texIndex;
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

    vec3 barycentric3(in vec3 f, in vec3 v1, in vec3 v2, in vec3 v3, in vec3 uv1, in vec3 uv2, in vec3 uv3) {
        //Linear System Solver Strategy
        vec3 m0 = v2 - v1;
        vec3 m1 = v3 - v1;


        float d00 = dot(m0, m0);
        float d01 = dot(m0, m1);
        float d11 = dot(m1, m1);
        float denom = 1.0 / (d00 * d11 - d01 * d01);

        vec3 m2   = f - v1;
        float d20 = dot(m2, m0);
        float d21 = dot(m2, m1);

        float a = (d11 * d20 - d01 * d21) * denom;
        float b = (d00 * d21 - d01 * d20) * denom;
        float c = 1.0 - a - b;

        vec3 uv = uv1 * c + uv2 * a + uv3 * b;

        return uv;
    }
        
    bool canSeePoint(in vec3 point, in vec3 where) {
        
        bool hasCollision = false;
        
        Ray ray;
        ray.place     = where;
        ray.direction = point - where;
        
        for(int i = 0; i < sceneTextureCount; i += objectStride) {
        
            // There is no early out. This is the best we can do, i.e.,
            // a for loop that does nothing.
            if( ! hasCollision) {
                vec3 a  = texture2D(sceneTexture, indexWrap(i + 1, sceneTextureSize.x) * sceneTextureUnit).xyz;
                vec3 b  = texture2D(sceneTexture, indexWrap(i + 2, sceneTextureSize.x) * sceneTextureUnit).xyz;
                vec3 c  = texture2D(sceneTexture, indexWrap(i + 3, sceneTextureSize.x) * sceneTextureUnit).xyz;

                vec3 where;
                float depth;
 
                // Ray intersection trial
                if( ! rayIntersetsTriangle(ray, a, b, c, where, depth)) {
                    if( depth >= -0.0000001 && depth <= 1.0000001 ) {
                        hasCollision = true;
                    }
                }
            }
        }
        
        return ! hasCollision;
    }

    /// Shader entry point
    void main(void) {

        // Default pixel color
        vec4 finalColor = vec4(0.5, 0.5, 0.5, 1);
        
        // List of debug colors
        vec4 colors[9];
        colors[0] = vec4(0.33, 0.48, 0.96, 1.0);
        colors[1] = vec4(0.03, 0.05, 0.85, 1.0);
        colors[2] = vec4(0.34, 0.71, 0.64, 1.0);
        colors[3] = vec4(0.28, 0.95, 0.40, 1.0);
        colors[4] = vec4(0.07, 0.70, 0.57, 1.0);
        colors[5] = vec4(0.26, 0.74, 0.26, 1.0);
        colors[6] = vec4(0.45, 0.06, 0.03, 1.0);
        colors[7] = vec4(0.76, 0.08, 0.63, 1.0);
        colors[8] = vec4(0.33, 0.87, 0.87, 1.0);
        
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
        int nearestOffset;
        float nearestDepth = 999999999.0;

        
        // Test against the whole world.
        for(int i = 0; i < sceneTextureCount; i += objectStride) {

            // In nearest neighour we trust.
            vec3 m  = texture2D(sceneTexture, indexWrap(i + 0, sceneTextureSize.x) * sceneTextureUnit).xyz;
    
            if(int(m) == 1) {
                vec3 a  = texture2D(sceneTexture, indexWrap(i + 1, sceneTextureSize.x) * sceneTextureUnit).xyz;
                vec3 b  = texture2D(sceneTexture, indexWrap(i + 2, sceneTextureSize.x) * sceneTextureUnit).xyz;
                vec3 c  = texture2D(sceneTexture, indexWrap(i + 3, sceneTextureSize.x) * sceneTextureUnit).xyz;

                vec3 where;
                float depth;
     
                // Ray intersection trial
                if( ! rayIntersetsTriangle(ray, a, b, c, where, depth)) {

                    // Only keep the nearest object
                    if(nearestDepth > depth) {
                        nearestOffset   = i;
                        nearestDepth    = depth;
                        nearestPosition = where;
                        hasNearest      = true;
                    }
                }
            } else {
                finalColor = vec4(0.0, 0.0, 0.0, 0.0);
            }
        }

        // Hardcoded light source
        vec3 light = vec3(-2.22, -2.444, 0.75);
        vec4 diffuse = vec4(1.0, 1.0, 1.0, 1.0);

        // If the ray hit something, apply lighting.
        if(hasNearest) {
            int i   = nearestOffset;
            vec3 m  = texture2D(sceneTexture, indexWrap(i + 0, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 a  = texture2D(sceneTexture, indexWrap(i + 1, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 b  = texture2D(sceneTexture, indexWrap(i + 2, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 c  = texture2D(sceneTexture, indexWrap(i + 3, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 n1 = texture2D(sceneTexture, indexWrap(i + 4, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 n2 = texture2D(sceneTexture, indexWrap(i + 5, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 n3 = texture2D(sceneTexture, indexWrap(i + 6, sceneTextureSize.x) * sceneTextureUnit).xyz;
            //vec2 u  = texture2D(sceneTexture, indexWrap(i + 7, sceneTextureSize.x) * sceneTextureUnit).xy;
            //vec2 v  = texture2D(sceneTexture, indexWrap(i + 8, sceneTextureSize.x) * sceneTextureUnit).xy;
            //vec2 w  = texture2D(sceneTexture, indexWrap(i + 9, sceneTextureSize.x) * sceneTextureUnit).xy;

            vec3 normal       = barycentric3(nearestPosition, a, b, c, n1, n2, n3);
            vec4 textureColor = int(m.y) != 1 ? colors[0] : colors[2];

            // Flip the normal based on the camera direction. Are we inside or
            // outside of objects.
            float flip = sign(dot(normal, -ray.direction));

            vec3 lightDir = normalize(light - nearestPosition);

            float lambert = max(dot(lightDir, normal * flip), 0.0) * 2.0;

            // Weight the diffuse color with the cosine
            vec4 blend = diffuse * lambert;

            // Light has no "alpha".
            blend.a    = 1.0;

            if(!canSeePoint(light, nearestPosition)) {
                blend.r = 0.0;
                blend.g = 0.0;
                blend.b = 0.0;
            }

            blend.r = max(0.22, blend.r);
            blend.g = max(0.22, blend.g);
            blend.b = max(0.22, blend.b);
        
            // Mix light and the texture color
            finalColor = textureColor * blend;
        }

        gl_FragColor = finalColor;
    }
        
*/
    };
});