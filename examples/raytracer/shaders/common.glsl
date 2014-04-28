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

/// Wrap index.
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

// http://stackoverflow.com/questions/17981163/webgl-read-pixels-from-floating-point-render-target
float shift_right (in float v, in float amt) { 
    v = floor(v) + 0.5; 
    return floor(v / exp2(amt)); 
}
float shift_left (in float v, in float amt) { 
    return floor(v * exp2(amt) + 0.5); 
}
float mask_last (in float v, in float bits) { 
    return mod(v, shift_left(1.0, bits)); 
}
float extract_bits (in float num, in float from, in float to) { 
    from = floor(from + 0.5); to = floor(to + 0.5); 
    return mask_last(shift_right(num, from), to - from); 
}
vec4 encode_float (in float val) { 
    if (val == 0.0) {
        return vec4(0, 0, 0, 0); 
    }
    
    float sign = val > 0.0 ? 0.0 : 1.0; 
    val = abs(val); 
    float exponent = floor(log2(val)); 
    float biased_exponent = exponent + 127.0; 
    float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0; 
    float t = biased_exponent / 2.0; 
    float last_bit_of_biased_exponent = fract(t) * 2.0; 
    float remaining_bits_of_biased_exponent = floor(t); 
    float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0; 
    float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0; 
    float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0; 
    float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0; 
    return vec4(byte4, byte3, byte2, byte1); 
}

// NB: not tested
float decode_float(in vec4 value) {
   const vec4 bitSh = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
   return(dot(value, bitSh));
}