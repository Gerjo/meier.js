precision highp float;

#include "shaders/common.glsl"
#include "shaders/settings.glsl"


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
uniform int interlacing;            // Interlacing constant
uniform sampler2D photonTexture;    // Texture containing the photon data.

uniform vec2 photonTextureSize;      // Dimensions in scene texture.
uniform vec2 photonTextureUnit;      // Scale pixel positions to UV scale.

// Grid related properties:
uniform ivec3 gridResolution;
uniform vec3 gridInterval;
uniform vec3 gridSize;
uniform vec3 gridMin;
uniform vec3 gridMax;


// Received from fragment shader:
varying vec2 inPosition;

Photon nearestPhoton(in vec3 where, inout vec4 blend) {    
    
    Photon photon; 
    photon.direction = vec3(0.0, 0.0, 0.0);
    photon.position  = vec3(Infinity, Infinity, Infinity);
    photon.meta      = vec2(0.0, 0.0);
    
    
    // Quantize pixel location to a grid location
    ivec3 gridQuantize = ivec3(
        floor((where.x - gridMin.x) / gridInterval.x),
        floor((where.y - gridMin.y) / gridInterval.y),
        floor((where.z - gridMin.z) / gridInterval.z)
    );
        
    int cellIndex = gridQuantize.z + (gridQuantize.y * gridResolution.x) + (gridQuantize.x * gridResolution.x * gridResolution.y);
    vec2 texIndex = indexWrap(cellIndex, photonTextureSize.x) * photonTextureUnit;
    vec3 cell     = texture2D(photonTexture, texIndex).xyz;
    
    int count = int(cell.x);
    int start = int(cell.y);
    int end   = int(cell.z);
    
    float weight   = 0.0;
    
    float nearestDistance = Infinity;
    int nearestIndex      = -1;
    
    float sigmaSum = 0.0;
     
    if(count > 0) {
        
        for(int i = 0; i < 160 * photonStride; i += photonStride) {
            int current = start + i;
            
            if(current <= end) {
                vec3 dir  = texture2D(photonTexture, indexWrap(current + 0, photonTextureSize.x) * photonTextureUnit).xyz;
                vec3 pos  = texture2D(photonTexture, indexWrap(current + 1, photonTextureSize.x) * photonTextureUnit).xyz;
                vec2 meta = texture2D(photonTexture, indexWrap(current + 2, photonTextureSize.x) * photonTextureUnit).xy;
                
                float d = lengthSq(pos - where);
                
                if(d < nearestDistance) {
                    nearestDistance  = d;
                    nearestIndex     = current;
                    
                    photon.position  = pos;
                }
                
                float sigma = 1.0;
                float sigmaPrecomputed = 1.0 / (2.0 * sigma * sigma);
                
                float w = exp(-d * sigmaPrecomputed);
                
                sigmaSum += w;
                weight   += meta.y * w;
            }
            
        }
    }
    
    weight /= sigmaSum * 55.0;
    
    blend.r += weight;
    blend.g += weight;
    blend.b += weight;
  
    return photon;
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
            if( rayIntersetsTriangle(ray, a, b, c, where, depth)) {
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
            
    if(mod(int((inPosition.x + 1.0) * 0.5 * windowSize.x), interlacing) != mod(frameCounter, interlacing)) {
        if(mod(int((inPosition.y + 1.0) * 0.5 * windowSize.y), interlacing) != mod(frameCounter, interlacing)) {
            discard;
        }
        // Possibly a hack. I assume the previous frame is still on the buffer.
        
        //return;
    }

    // Default pixel color
    vec4 finalColor = vec4(0.5, 0.5, 0.5, 1.0);
    
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
    float nearestDepth = Infinity;

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
            if(rayIntersetsTriangle(ray, a, b, c, where, depth)) {

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


        vec3 normal       = barycentric3(nearestPosition, a, b, c, n1, n2, n3);
        vec4 textureColor = int(m.y) != 1 ? colors[0] : colors[2];

        // Flip the normal based on the camera direction. Are we inside or
        // outside of objects.
        float flip = sign(dot(normal, -ray.direction));

        vec3 lightDir = normalize(light - nearestPosition);

        float lambert = max(dot(lightDir, normal * flip), 0.0) * 2.0;

        // Weight the diffuse color with the cosine
        vec4 blend = diffuse * lambert;

        // No light.
        if( ! canSeePoint(light, nearestPosition)) {
            blend.r = 0.0;
            blend.g = 0.0;
            blend.b = 0.0;
        }
        
        Photon photon = nearestPhoton(nearestPosition, blend);

        blend.r = max(0.17, blend.r);
        blend.g = max(0.17, blend.g);
        blend.b = max(0.17, blend.b);


        float d = length(photon.position - nearestPosition);
        
        if(d < Infinity) {
            //blend += 1.0 / (d * 20.8);
            
            if(d < 0.03) {
                blend.r += 10.0;
            }
        }
        /*if(d < 0.1) {
            blend.r += 0.4;
            blend.g += 0.4;
            blend.b += 0.4;
        } else if(d < 0.12) {
            blend.r = 0.1;
            blend.g = 0.1;
            blend.b = 0.1;
        } else {
            // too far
        }*/
        
        // Light has no "alpha".
        blend.a = 1.0;
    
        // Mix light and the texture color
        //finalColor = textureColor * vec4(photon.direction, 1.0);
        finalColor = textureColor * blend + vec4(photon.direction, 1.0);
    }

    gl_FragColor = finalColor;
}