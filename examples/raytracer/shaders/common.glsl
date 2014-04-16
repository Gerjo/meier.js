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