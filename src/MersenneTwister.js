/*
 * NOTE :
 * 	This program is a JavaScript version of Mersenne Twister,
 * 	conversion from the original program (mt19937ar.c),
 * 	translated by yunos on december, 6, 2008.
 * 	If you have any questions about this program, please ask me by e-mail.
 * 
 * 
 * 
 * Updated 2008/12/08
 * Ver. 1.00
 * charset = UTF8
 * 
 * Mail : info@graviness.com
 * Home : http://www.graviness.com/
 * 
 * æ“¬ä¼¼ä¹±æ•°ç”Ÿæˆå™¨ãƒ¡ãƒ«ã‚»ãƒ³ãƒŒãƒ»ãƒ„ã‚¤ã‚¹ã‚¿ã‚¯ãƒ©ã‚¹ï¼Ž
 * 
 * Mathã‚¯ãƒ©ã‚¹ã®ã‚¯ãƒ©ã‚¹ãƒ¡ã‚½ãƒƒãƒ‰ã«mersenneTwisterRandomãƒ¡ã‚½ãƒƒãƒ‰ã‚’è¿½åŠ ã—ã¾ã™ï¼Ž
 * 
 * Ref.
 * 	http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/mt.html
 */



/**
 * æ“¬ä¼¼ä¹±æ•°ç”Ÿæˆå™¨ãƒ¡ãƒ«ã‚»ãƒ³ãƒŒãƒ»ãƒ„ã‚¤ã‚¹ã‚¿ã‚¯ãƒ©ã‚¹ï¼Ž
 * 
 * æ“¬ä¼¼ä¹±æ•°ç”Ÿæˆæ–¹æ³•ã®æ¨™æº–ã§ã‚ã‚‹ãƒ¡ãƒ«ã‚»ãƒ³ãƒŒãƒ»ãƒ„ã‚¤ã‚¹ã‚¿ãŒå®Ÿè£…ã•ã‚Œã¾ã™ï¼Ž
 * 
 * ç¬¦å·ç„¡ã—32ãƒ“ãƒƒãƒˆæ•´æ•°åž‹ã®ä¸€æ§˜ä¹±æ•°ã‚’åŸºæœ¬ã¨ã—ï¼Œç¬¦å·ç„¡ã—46ãƒ“ãƒƒãƒˆæ•´æ•°åž‹ä¸€æ§˜ä¹±æ•°ï¼Œ
 * æµ®å‹•å°æ•°ç‚¹åž‹ã®ä¸€æ§˜ä¹±æ•°ã‚’ç”Ÿæˆã—ã¾ã™ï¼Ž
 * ä¹±æ•°ç”Ÿæˆã®åˆæœŸåŒ–ã«ã¯ï¼Œä¸€ã¤ã®æ•´æ•°ã‚’ä½¿ç”¨ã—ã¾ã™ãŒï¼Œå¿…è¦ã«å¿œã˜ã¦
 * é…åˆ—ã‚’ç”¨ã„ãŸä»»æ„ãƒ“ãƒƒãƒˆå¹…ã®å€¤ã‚’ä½¿ç”¨ã™ã‚‹ã“ã¨ã‚‚ã§ãã¾ã™ï¼Ž
 * 
 * ã“ã®ã‚¯ãƒ©ã‚¹ã¯ä»¥ä¸‹ã®ã‚µã‚¤ãƒˆ(Cè¨€èªžã‚½ãƒ¼ã‚¹)ã®JavaScriptè¨€èªžç§»æ¤ç‰ˆã§ã™ï¼Ž
 * http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/CODES/mt19937ar.c
 * (http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/mt.html)
 * å¤–éƒ¨ã‚¤ãƒ³ã‚¿ãƒ•ã‚§ãƒ¼ã‚¹ã¯ï¼ŒJavaã®java.util.Randomã‚¯ãƒ©ã‚¹ã‚’å‚è€ƒã«å®Ÿè£…ã•ã‚Œã¦ã„ã¾ã™ï¼Ž
 * http://sdc.sun.co.jp/java/docs/j2se/1.4/ja/docs/ja/api/java/util/Random.html
 * 
 * æ€§èƒ½ã¯ï¼Œãƒ“ãƒ«ãƒˆã‚¤ãƒ³ã®Math.randomã®ç´„2åˆ†ã®ä¸€ã§ã™ãŒï¼Œ
 * ä¹±æ•°ã®å“è³ªã¯å½“è©²ã‚µã‚¤ãƒˆã«ç¤ºã™é€šã‚Šã§ã™ï¼Ž
 * 
 * ä½¿ç”¨ä¾‹)
 * // ã‚¤ãƒ³ã‚¹ã‚¿ãƒ³ã‚¹ã‚’ç”Ÿæˆã—ï¼Œä¹±æ•°ç”Ÿæˆå™¨ã‚’ç¾åœ¨æ™‚åˆ»ã§åˆæœŸåŒ–ã—ã¾ã™ï¼Ž
 * var mt = new MersenneTwister(new Date().getTime());
 * for (var i = 0; i < 1000; ++i) {
 * 	// 32ãƒ“ãƒƒãƒˆç¬¦å·ç„¡ã—æ•´æ•°åž‹ã®ä¸€æ§˜ä¹±æ•°
 * 	var randomNumber = mt.nextInteger();
 * }
 */
function class__MersenneTwister__(window)
{
	var className = "MersenneTwister";

	var $next = "$__next__";

	var N = 624;
	var M = 397;
	var MAG01 = [0x0, 0x9908b0df];

	/**
	 * æ–°ã—ã„ä¹±æ•°ã‚¸ã‚§ãƒãƒ¬ãƒ¼ã‚¿ã‚’ç”Ÿæˆã—ã¾ã™ï¼Ž
	 * å¼•æ•°ã«å¿œã˜ãŸã‚·ãƒ¼ãƒ‰ã‚’è¨­å®šã—ã¾ã™ï¼Ž
	 * 
	 * @param (None)	æ–°ã—ã„ä¹±æ•°ã‚¸ã‚§ãƒãƒ¬ãƒ¼ã‚¿ã‚’ç”Ÿæˆã—ã¾ã™ï¼Ž
	 * ã‚·ãƒ¼ãƒ‰ã¯ç¾åœ¨æ™‚åˆ»ã‚’ä½¿ç”¨ã—ã¾ã™ï¼Ž
	 * @see Date#getTime()
	 * ---
	 * @param number	
	 * @see #setSeed(number)
	 * ---
	 * @param number[]	
	 * @see #setSeed(number[])
	 * ---
	 * @param number, number, ...	
	 * @see #setSeed(number, number, ...)
	 */
	var F = window[className] = function()
	{
		this.mt = new Array(N);
		this.mti = N + 1;

		var a = arguments;
		switch (a.length) {
		case 0:
			this.setSeed(new Date().getTime());
			break;
		case 1:
			this.setSeed(a[0]);
			break;
		default:
			var seeds = new Array();
			for (var i = 0; i < a.length; ++i) {
				seeds.push(a[i]);
			}
			this.setSeed(seeds);
			break;
		}
	};

	var FP = F.prototype;

	/**
	 * ä¹±æ•°ã‚¸ã‚§ãƒãƒ¬ãƒ¼ã‚¿ã®ã‚·ãƒ¼ãƒ‰ã‚’è¨­å®šã—ã¾ã™ï¼Ž
	 * 
	 * @param number	å˜ä¸€ã®æ•°å€¤ã‚’ä½¿ç”¨ã—ï¼Œ
	 * 	ä¹±æ•°ã‚¸ã‚§ãƒãƒ¬ãƒ¼ã‚¿ã®ã‚·ãƒ¼ãƒ‰ã‚’è¨­å®šã—ã¾ã™ï¼Ž
	 * ---
	 * @param number[]	è¤‡æ•°ã®æ•°å€¤ã‚’ä½¿ç”¨ã—ï¼Œ
	 * 	ä¹±æ•°ã‚¸ã‚§ãƒãƒ¬ãƒ¼ã‚¿ã®ã‚·ãƒ¼ãƒ‰ã‚’è¨­å®šã—ã¾ã™ï¼Ž
	 * ---
	 * @param number, number, ...	è¤‡æ•°ã®æ•°å€¤ã‚’ä½¿ç”¨ã—ï¼Œ
	 * 	ä¹±æ•°ã‚¸ã‚§ãƒãƒ¬ãƒ¼ã‚¿ã®ã‚·ãƒ¼ãƒ‰ã‚’è¨­å®šã—ã¾ã™ï¼Ž
	 */
	FP.setSeed = function()
	{
		var a = arguments;
		switch (a.length) {
		case 1:
			if (a[0].constructor === Number) {
				this.mt[0]= a[0];
				for (var i = 1; i < N; ++i) {
					var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
					this.mt[i] = ((1812433253 * ((s & 0xffff0000) >>> 16))
							<< 16)
						+ 1812433253 * (s & 0x0000ffff)
						+ i;
				}
				this.mti = N;
				return;
			}

			this.setSeed(19650218);

			var l = a[0].length;
			var i = 1;
			var j = 0;

			for (var k = N > l ? N : l; k != 0; --k) {
				var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30)
				this.mt[i] = (this.mt[i]
						^ (((1664525 * ((s & 0xffff0000) >>> 16)) << 16)
							+ 1664525 * (s & 0x0000ffff)))
					+ a[0][j]
					+ j;
				if (++i >= N) {
					this.mt[0] = this.mt[N - 1];
					i = 1;
				}
				if (++j >= l) {
					j = 0;
				}
			}

			for (var k = N - 1; k != 0; --k) {
				var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
				this.mt[i] = (this.mt[i]
						^ (((1566083941 * ((s & 0xffff0000) >>> 16)) << 16)
							+ 1566083941 * (s & 0x0000ffff)))
					- i;
				if (++i >= N) {
					this.mt[0] = this.mt[N-1];
					i = 1;
				}
			}

			this.mt[0] = 0x80000000;
			return;
		default:
			var seeds = new Array();
			for (var i = 0; i < a.length; ++i) {
				seeds.push(a[i]);
			}
			this.setSeed(seeds);
			return;
		}
	};

	/**
	 * æ¬¡ã®æ“¬ä¼¼ä¹±æ•°ã‚’ç”Ÿæˆã—ã¾ã™ï¼Ž
	 * @param bits	å‡ºåŠ›å€¤ã®æœ‰åŠ¹ãƒ“ãƒƒãƒˆæ•°ã‚’æŒ‡å®šã—ã¾ã™ï¼Ž
	 * 	0 &lt; bits &lt;= 32ã§æŒ‡å®šã—ã¾ã™ï¼Ž
	 * @param æ¬¡ã®æ“¬ä¼¼ä¹±æ•°ï¼Ž
	 */
	FP[$next] = function(bits)
	{
		if (this.mti >= N) {
			var x = 0;

			for (var k = 0; k < N - M; ++k) {
				x = (this.mt[k] & 0x80000000) | (this.mt[k + 1] & 0x7fffffff);
				this.mt[k] = this.mt[k + M] ^ (x >>> 1) ^ MAG01[x & 0x1];
			}
			for (var k = N - M; k < N - 1; ++k) {
				x = (this.mt[k] & 0x80000000) | (this.mt[k + 1] & 0x7fffffff);
				this.mt[k] = this.mt[k + (M - N)] ^ (x >>> 1) ^ MAG01[x & 0x1];
			}
			x = (this.mt[N - 1] & 0x80000000) | (this.mt[0] & 0x7fffffff);
			this.mt[N - 1] = this.mt[M - 1] ^ (x >>> 1) ^ MAG01[x & 0x1];

			this.mti = 0;
		}

		var y = this.mt[this.mti++];
		y ^= y >>> 11;
		y ^= (y << 7) & 0x9d2c5680;
		y ^= (y << 15) & 0xefc60000;
		y ^= y >>> 18;
		return y >>> (32 - bits);
	};

	/**
	 * ä¸€æ§˜åˆ†å¸ƒã®booleanåž‹ã®æ“¬ä¼¼ä¹±æ•°ã‚’è¿”ã—ã¾ã™ï¼Ž
	 * @return true or falseï¼Ž
	 */
	FP.nextBoolean = function()
	{
		return this[$next](1) == 1;
	};

	/**
	 * ä¸€æ§˜åˆ†å¸ƒã®ç¬¦å·ç„¡32ãƒ“ãƒƒãƒˆæ•´æ•°åž‹ã®æ“¬ä¼¼ä¹±æ•°ã‚’è¿”ã—ã¾ã™ï¼Ž
	 * @return ç¬¦å·ç„¡32ãƒ“ãƒƒãƒˆæ•´æ•°åž‹ã®æ“¬ä¼¼ä¹±æ•°ã§ï¼Œ0ä»¥ä¸Š4294967295ä»¥ä¸‹ã§ã™ï¼Ž
	 */
	FP.nextInteger = function()
	{
		return this[$next](32);
	};

	/**
	 * ä¸€æ§˜åˆ†å¸ƒã®ç¬¦å·ç„¡46ãƒ“ãƒƒãƒˆæ•´æ•°åž‹ã®æ“¬ä¼¼ä¹±æ•°ã‚’è¿”ã—ã¾ã™ï¼Ž
	 * @return ç¬¦å·ç„¡46ãƒ“ãƒƒãƒˆæ•´æ•°åž‹ã®æ“¬ä¼¼ä¹±æ•°ã§ï¼Œ0ä»¥ä¸Š70368744177663ä»¥ä¸‹ã§ã™ï¼Ž
	 */
	FP.nextLong = function()
	{
		// NOTE: 48ãƒ“ãƒƒãƒˆä»¥ä¸Šã§è¨ˆç®—çµæžœãŒããšã‚Œã‚‹ï¼Ž
		// (46 - 32) = 14 = [7] + [7], 32 - [7] = [25], 32 - [7] = [25]
		// 2^(46 - [25]) = 2^21 = [2097152]
		return this[$next](25) * 2097152 + this[$next](25);
	};

	/**
	 * 0.0ï½ž1.0ã®ç¯„å›²ã§ä¸€æ§˜åˆ†å¸ƒã®32ãƒ“ãƒƒãƒˆãƒ™ãƒ¼ã‚¹ã®
	 * æµ®å‹•å°æ•°ç‚¹åž‹ã®æ“¬ä¼¼ä¹±æ•°ã‚’è¿”ã—ã¾ã™ï¼Ž
	 * @return åŠé–‹åŒºé–“ã®[0.0 1.0)ã§ã™ï¼Ž
	 */
	FP.nextFloat = function()
	{
		return this[$next](32) / 4294967296.0; // 2^32
	};

	/**
	 * 0.0ï½ž1.0ã®ç¯„å›²ã§ä¸€æ§˜åˆ†å¸ƒã®46ãƒ“ãƒƒãƒˆãƒ™ãƒ¼ã‚¹ã®
	 * æµ®å‹•å°æ•°ç‚¹åž‹ã®æ“¬ä¼¼ä¹±æ•°ã‚’è¿”ã—ã¾ã™ï¼Ž
	 * @return åŠé–‹åŒºé–“ã®[0.0 1.0)ã§ã™ï¼Ž
	 */
	FP.nextDouble = function()
	{
		return (this[$next](25) * 2097152 + this[$next](25))
			/ 70368744177664.0; // 2^46
	};

} class__MersenneTwister__(window);



/**
 * æ“¬ä¼¼ä¹±æ•°ç”Ÿæˆã«ãƒ¡ãƒ«ã‚»ãƒ³ãƒŒãƒ»ãƒ„ã‚¤ã‚¹ã‚¿ã‚’ä½¿ç”¨ã—ï¼ŒåŠé–‹åŒºé–“[0 1.0)ã®
 * æµ®å‹•å°æ•°ç‚¹åž‹ã®æ“¬ä¼¼ä¹±æ•°ã‚’ç”Ÿæˆã—ã¾ã™ï¼Ž
 * Math.randomã¨åŒæ§˜ã«ä½¿ç”¨ã—ã¾ã™ï¼Ž
 * 
 * ä½¿ç”¨ä¾‹)
 * // 0ä»¥ä¸Š1ã‚ˆã‚Šå°ã•ã„ä¸å‹•å°æ•°ç‚¹åž‹ã®å€¤ã‚’ç”Ÿæˆã—ã¾ã™ï¼Ž
 * var r = Math.mersenneTwisterRandom();
 */
Math.mersenneTwisterRandom = function()
{
	Math.__MERSENNE_TWISTER__ = new MersenneTwister();

	return function() {
		return Math.__MERSENNE_TWISTER__;
	}
}();

/// Exposing my own interface: (addition by gerard)
Random = (function() {
    var mt = new MersenneTwister();
    
    return {
        Seed: function(seed) {
            mt.setSeed(seed);
        },
        
        /// [0..1]
        Float: function() {
            return mt.nextFloat();
        },
        
        Integer: function() {
            return mt.nextInteger();
        },
        
        Boolean: function() {
            return mt.nextBoolean();
        },
        
        Range: function(min, max) {
            return mt.nextFloat() * (max - min) + min;
        },
        
        /// Returns a random vector distributed on a unit circle.
        Vector: function() {
            var tan = mt.nextFloat() * Math.PI * 2;
            
            return new Vector(Math.cos(tan), Math.sin(tan));
        }
    };
}());
