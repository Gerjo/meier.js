define(function(require) {
    // Permutation table. This is just a random jumble of all numbers 0-255,
    // repeated twice to avoid wrapping the index at 255 for each lookup.
    // This needs to be exactly the same for all instances on all platforms,
    // so it's easiest to just keep it as static explicit data.
    // This also removes the need for any initialisation of this class.
    // Note that making this an int[] instead of a char[] might make the
    // code run faster on platforms with a high penalty for unaligned single
    // byte addressing. Intel x86 is generally single-byte-friendly, but
    // some other CPUs are faster with 4-aligned reads.
    // However, a char[] is smaller, which avoids cache trashing, and that
    // is probably the most important aspect on most architectures.
    // This array is accessed a *lot* by the noise functions.
    // A vector-valued noise over 3D accesses it 96 times, and a
    // float-valued 4D noise 64 times. We want this to fit in the cache!
    var perm = [
      151,160,137,91,90,15,
      131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
      190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
      88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
      77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
      102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
      135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
      5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
      223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
      129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
      251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
      49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
      138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180,
      151,160,137,91,90,15,
      131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
      190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
      88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
      77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
      102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
      135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
      5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
      223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
      129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
      251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
      49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
      138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];



    // Helper functions to compute gradients-dot-residualvectors (1D to 4D)
    // Note that these generate gradients of more than unit length. To make
    // a close match with the value range of classic Perlin noise, the final
    // noise values need to be rescaled. To match the RenderMan noise in a
    // statistical sense, the approximate scaling values (empirically
    // determined from test renderings) are:
    // 1D noise needs rescaling with 0.188
    // 2D noise needs rescaling with 0.507
    // 3D noise needs rescaling with 0.936
    // Note that these noise functions are the most practical and useful
    // signed version of Perlin noise.
    function Gradient(hash, x, y, z) {
        var h = hash & 15;					   			// Convert low 4 bits of hash code into 12 simple
        var u = h < 8 ? x : y;				            // gradient directions, and compute dot product.
        var v = h < 4 ? y : h == 12 || h == 14 ? x : z;	// Fix repeats at h = 12 to 15
        return ((h&1)? -u : u) + ((h&2)? -v : v);
    }


    // 3D float Perlin noise (non periodic)
    function Noise(x, y, z) {
        var ix0, iy0, ix1, iy1, iz0, iz1;
        var fx0, fy0, fz0, fx1, fy1, fz1;
        var s, t, r;
        var nxy0, nxy1, nx0, nx1, n0, n1;

        ix0 = Math.floor( x ); // Integer part of x
        iy0 = Math.floor( y ); // Integer part of y
        iz0 = Math.floor( z ); // Integer part of z
        fx0 = x - ix0;        // Fractional part of x
        fy0 = y - iy0;        // Fractional part of y
        fz0 = z - iz0;        // Fractional part of z
        fx1 = fx0 - 1.0;
        fy1 = fy0 - 1.0;
        fz1 = fz0 - 1.0;
        ix1 = ( ix0 + 1 ) & 0xff; // Wrap to 0..255
        iy1 = ( iy0 + 1 ) & 0xff;
        iz1 = ( iz0 + 1 ) & 0xff;
        ix0 = ix0 & 0xff;
        iy0 = iy0 & 0xff;
        iz0 = iz0 & 0xff;
    
        // Horner's method with a 5th degree polynomial
        r = ( fz0 * fz0 * fz0 * ( fz0 * ( fz0 * 6 - 15 ) + 10 ) );
        t = ( fy0 * fy0 * fy0 * ( fy0 * ( fy0 * 6 - 15 ) + 10 ) );
        s = ( fx0 * fx0 * fx0 * ( fx0 * ( fx0 * 6 - 15 ) + 10 ) );

        nxy0 = Gradient(perm[ix0 + perm[iy0 + perm[iz0]]], fx0, fy0, fz0);
        nxy1 = Gradient(perm[ix0 + perm[iy0 + perm[iz1]]], fx0, fy0, fz1);
        nx0 = nxy0 + r * (nxy1 - nxy0);

        nxy0 = Gradient(perm[ix0 + perm[iy1 + perm[iz0]]], fx0, fy1, fz0);
        nxy1 = Gradient(perm[ix0 + perm[iy1 + perm[iz1]]], fx0, fy1, fz1);
        nx1 = nxy0 + r * (nxy1 - nxy0);

        n0 = nx0 + t * (nx1 - nx0); 

        nxy0 = Gradient(perm[ix1 + perm[iy0 + perm[iz0]]], fx1, fy0, fz0);
        nxy1 = Gradient(perm[ix1 + perm[iy0 + perm[iz1]]], fx1, fy0, fz1);
        nx0 = nxy0 + r * (nxy1 - nxy0);

        nxy0 = Gradient(perm[ix1 + perm[iy1 + perm[iz0]]], fx1, fy1, fz0);
        nxy1 = Gradient(perm[ix1 + perm[iy1 + perm[iz1]]], fx1, fy1, fz1);
        nx1 = nxy0 + r * (nxy1 - nxy0);

        n1 = nx0 + t * (nx1 - nx0);
    
        return 0.936 * (n0 + s * (n1 - n0));
    }
    
    return Noise;
});