#extension GL_EXT_draw_buffers : require

precision highp float;

#include "shaders/common.glsl"
#include "shaders/settings.glsl"

uniform int readBuffer;
uniform int writeBuffer;

varying vec2 uvmapping;
varying vec2 uvunit;

// Data from previous bounce. These are sensible float textures.
uniform sampler2D samplerDirection;
uniform sampler2D samplerPosition;
uniform sampler2D samplerMeta;

uniform sampler2D sceneTexture;     // Sampler width scene data.
uniform vec2 sceneTextureSize;      // Dimensions in scene texture.
uniform vec2 sceneTextureUnit;      // Scale pixel positions to UV scale.

void main() {
    // Retrieve from previous bounce iteration
    vec3 inDirection = texture2D(samplerDirection, uvmapping).xyz;
    vec3 inPosition  = texture2D(samplerPosition, uvmapping).xyz;
    vec2 inMeta      = texture2D(samplerMeta, uvmapping).xy;
    
    
    srand(inDirection.x + inDirection.y * uvmapping.x);
    
    bool isAlive = int(inMeta.x) == 1;
    
    // Initialize defaults
    vec3 outDirection = vec3(0, 0, 0);
    vec3 outPosition  = vec3(0, 0, 0);
    vec2 outMeta      = vec2(0, 0);
    
    if(isAlive) {
        Ray ray;
        ray.place     = inPosition;
        ray.direction = inDirection;
    
    
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
                if( rayIntersetsTriangle(ray, a, b, c, where, depth)) {

                    // Only keep the nearest object
                    if(depth < nearestDepth) {
                        nearestOffset   = i;
                        nearestDepth    = depth;
                        nearestPosition = where;
                        hasNearest      = true;
                    }
                }
            } else {
                // Not a triangle.
            }
        }
    
        // Photon hit something
        if(hasNearest && isAlive) {

            // Lookup more details about the intersecting surface
            int i   = nearestOffset;
            vec3 m  = texture2D(sceneTexture, indexWrap(i + 0, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 a  = texture2D(sceneTexture, indexWrap(i + 1, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 b  = texture2D(sceneTexture, indexWrap(i + 2, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 c  = texture2D(sceneTexture, indexWrap(i + 3, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 n1 = texture2D(sceneTexture, indexWrap(i + 4, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 n2 = texture2D(sceneTexture, indexWrap(i + 5, sceneTextureSize.x) * sceneTextureUnit).xyz;
            vec3 n3 = texture2D(sceneTexture, indexWrap(i + 6, sceneTextureSize.x) * sceneTextureUnit).xyz;
        
            vec3 normal = normalize(barycentric3(nearestPosition, a, b, c, n1, n2, n3));

            // Normal to point towards the photon. *experimental*
            normal *= sign(dot(normal, -ray.direction));
        
            outPosition  = nearestPosition; // Point of collision
            outMeta.x    = 1.0;             // Alive
            
            // Specular reflection
            //outDirection = reflect(ray.direction, normal);
        
            // Diffuse reflection
            for(int i = 0; i < 5; ++i) {
                if(i == 0 || dot(normal, outDirection) < 0.0) {
                    outDirection.x = rand() * 2.0 - 1.0;
                    outDirection.y = rand() * 2.0 - 1.0;
                    outDirection.z = rand() * 2.0 - 1.0;
                }
            }
            
            // A suitable reflection wasn't found in sensible time. Kill
            // the photon.
            if(dot(normal, outDirection) < 0.0) {
                outMeta.x = 0.0;
            }
            
            outDirection = normalize(outDirection);
        
            // Flux decay weighted by cosine. (smearing flux)
            outMeta.y    = inMeta.y * max(0.2, dot(normal, outDirection));// * 0.8;
        
        
        // Photon hit nothing at all. Defaults are OK
        }
    }
    
    // Smear components into 8, 4-byte vectors.
    gl_FragData[0] = encode_float(outDirection.x);
    gl_FragData[1] = encode_float(outDirection.y);
    gl_FragData[2] = encode_float(outDirection.z);
    gl_FragData[3] = encode_float(outPosition.x);
    gl_FragData[4] = encode_float(outPosition.y);
    gl_FragData[5] = encode_float(outPosition.z);
    gl_FragData[6] = encode_float(outMeta.x);
    gl_FragData[7] = encode_float(outMeta.y);
}
