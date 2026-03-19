/**
 * Andrew Coleman – Portfolio Website
 * main.js — All client-side JavaScript
 */

/* ═══════════════════════════════════════
   Utility Functions
   ═══════════════════════════════════════ */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function smoothstep(edge0, edge1, x) {
  var t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function randomRange(min, max) { return min + Math.random() * (max - min); }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function wrapCoord(c, max) {
  if (c >= max) return c % max;
  if (c <= 0) return max + c;
  return c;
}

/* ═══════════════════════════════════════
   3D Simplex Noise
   Based on Stefan Gustavson's algorithm (public domain)
   ═══════════════════════════════════════ */
var SimplexNoise = (function () {
  var grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];

  var perm = new Uint8Array(512);
  var permMod12 = new Uint8Array(512);

  // Seed with a fixed permutation table for reproducibility
  var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,
    103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,
    62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,
    136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,
    229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,
    25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,
    116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
    189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,
    155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,
    112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
    81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,
    204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,
    24,72,243,141,128,195,78,66,215,61,156,180];

  for (var i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = perm[i] % 12;
  }

  var F3 = 1.0 / 3.0;
  var G3 = 1.0 / 6.0;

  function dot3(g, x, y, z) {
    return g[0] * x + g[1] * y + g[2] * z;
  }

  function noise3D(xin, yin, zin) {
    var s = (xin + yin + zin) * F3;
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var X0 = i - t;
    var Y0 = j - t;
    var Z0 = k - t;
    var x0 = xin - X0;
    var y0 = yin - Y0;
    var z0 = zin - Z0;

    var i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0)      { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
      else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
      else               { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
    } else {
      if (y0 < z0)       { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
      else if (x0 < z0)  { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
      else               { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
    }

    var x1 = x0 - i1 + G3;
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2.0 * G3;
    var y2 = y0 - j2 + 2.0 * G3;
    var z2 = z0 - k2 + 2.0 * G3;
    var x3 = x0 - 1.0 + 3.0 * G3;
    var y3 = y0 - 1.0 + 3.0 * G3;
    var z3 = z0 - 1.0 + 3.0 * G3;

    var ii = i & 255;
    var jj = j & 255;
    var kk = k & 255;
    var gi0 = permMod12[ii + perm[jj + perm[kk]]];
    var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
    var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
    var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];

    var n0, n1, n2, n3;
    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else { t0 *= t0; n0 = t0 * t0 * dot3(grad3[gi0], x0, y0, z0); }

    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else { t1 *= t1; n1 = t1 * t1 * dot3(grad3[gi1], x1, y1, z1); }

    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else { t2 *= t2; n2 = t2 * t2 * dot3(grad3[gi2], x2, y2, z2); }

    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else { t3 *= t3; n3 = t3 * t3 * dot3(grad3[gi3], x3, y3, z3); }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  function fbm(x, y, z, octaves, persistence) {
    var value = 0, amplitude = 1, frequency = 1, maxValue = 0;
    for (var i = 0; i < octaves; i++) {
      value += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return value / maxValue;
  }

  return { noise3D: noise3D, fbm: fbm };
})();

/* ═══════════════════════════════════════
   Atmospheric Canvas System
   ═══════════════════════════════════════ */
var ATMOSPHERE = {
  STAR_DENSITY: 1000,
  STAR_MAX_RADIUS: 1.2,
  STAR_HUES: [0, 60, 210, 240],
  TWINKLE_SPEED_MIN: 0.25,
  TWINKLE_SPEED_MAX: 1.27,
  DRIFT_SPEED: 0.013,
  PARALLAX_SMOOTHING: 0.08,

  SHOOTING_STAR_MIN_INTERVAL: 3000,
  SHOOTING_STAR_MAX_INTERVAL: 8000,
  SHOOTING_STAR_SPEED: 10,
  SHOOTING_STAR_TRAIL_LENGTH: 25,

  MIST_SPAWN_RATE: 2,
  MIST_MAX_PARTICLES: 40,
  MIST_LIFETIME_MIN: 600,
  MIST_LIFETIME_MAX: 1200,
  MIST_OPACITY: 0.30,
  MIST_RADIUS_MAX: 10,

  IDLE_THRESHOLD: 10000,

  FOG_SCALE: 6,
  FOG_NOISE_SCALE: 0.004,
  FOG_TIME_SCALE: 0.15,
  FOG_CLEAR_RADIUS: 80,

  HERO_FOG_NOISE_SCALE: 0.003,
  HERO_FOG_DENSITY: 0.9,
  HERO_FOG_DRIFT_SPEED: 0.12,
};

(function () {
  var canvas = document.getElementById("atmosphere");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (e) {
    prefersReducedMotion = e.matches;
  });

  var W = 0, H = 0;
  var stars = [];
  var shootingStars = [];
  var mistParticles = [];
  var mouseX = 0, mouseY = 0;
  var smoothMouseX = 0, smoothMouseY = 0;
  var lastInteraction = performance.now();
  var nextShootingStar = performance.now() + randomRange(ATMOSPHERE.SHOOTING_STAR_MIN_INTERVAL, ATMOSPHERE.SHOOTING_STAR_MAX_INTERVAL);
  var scrollProgress = 0;
  var isTabVisible = true;

  /* ── Star ── */
  function Star(cw, ch) {
    this.x = Math.random() * cw;
    this.y = Math.random() * ch;
    this.radius = Math.random() * ATMOSPHERE.STAR_MAX_RADIUS;
    this.hue = ATMOSPHERE.STAR_HUES[randomInt(0, ATMOSPHERE.STAR_HUES.length - 1)];
    this.sat = randomInt(50, 100);
    this.depth = randomInt(1, 3);
    this.baseOpacity = 0.6 + Math.random() * 0.4;
    this.twinkleSpeed = randomRange(ATMOSPHERE.TWINKLE_SPEED_MIN, ATMOSPHERE.TWINKLE_SPEED_MAX);
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.opacity = this.baseOpacity;
  }

  Star.prototype.update = function (time) {
    this.opacity = this.baseOpacity * (0.5 + 0.5 * Math.sin(time * this.twinkleSpeed + this.twinklePhase));
    var driftFactor = this.depth * ATMOSPHERE.DRIFT_SPEED;
    this.x = wrapCoord(this.x + 0.5 * driftFactor, W);
    this.y = wrapCoord(this.y + 0.15 * driftFactor, H);
  };

  Star.prototype.applyParallax = function (hw, hh, smx, smy) {
    var factor = this.depth * 0.01 + (this.depth === 3 ? 0.02 : 0);
    this.x = wrapCoord(this.x - (smx - hw) * factor, W);
    this.y = wrapCoord(this.y - (smy - hh) * factor, H);
  };

  Star.prototype.draw = function (brightnessMult) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "hsla(" + this.hue + "," + this.sat + "%,88%," + (this.opacity * brightnessMult) + ")";
    ctx.fill();
  };

  /* ── Shooting Star ── */
  function ShootingStar() {
    this.x = W * 0.3 + Math.random() * W * 0.7;
    this.y = Math.random() * H * 0.3;
    this.angle = Math.PI * 0.6 + (Math.random() - 0.5) * 0.4;
    this.speed = ATMOSPHERE.SHOOTING_STAR_SPEED + Math.random() * 6;
    this.trail = [];
    this.maxTrail = ATMOSPHERE.SHOOTING_STAR_TRAIL_LENGTH;
    this.opacity = 1;
    this.fadeRate = 0.015 + Math.random() * 0.01;
  }

  ShootingStar.prototype.update = function () {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrail) this.trail.pop();
    this.opacity -= this.fadeRate;
  };

  ShootingStar.prototype.draw = function () {
    for (var i = 0; i < this.trail.length; i++) {
      var t = 1 - i / this.trail.length;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, 1.5 * t, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255," + (t * this.opacity * 0.7) + ")";
      ctx.fill();
    }
  };

  ShootingStar.prototype.isDead = function () { return this.opacity <= 0; };

  /* ── Mist Particle ── */
  function MistParticle(x, y) {
    this.x = x + (Math.random() - 0.5) * 30;
    this.y = y + (Math.random() - 0.5) * 30;
    this.radius = 3 + Math.random() * ATMOSPHERE.MIST_RADIUS_MAX;
    this.maxOpacity = ATMOSPHERE.MIST_OPACITY * (0.5 + Math.random() * 0.5);
    this.life = randomRange(ATMOSPHERE.MIST_LIFETIME_MIN, ATMOSPHERE.MIST_LIFETIME_MAX);
    this.born = -1;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3 - 0.1;
    this.opacity = 0;
  }

  MistParticle.prototype.update = function (now) {
    if (this.born < 0) this.born = now;
    var age = now - this.born;
    this.x += this.vx;
    this.y += this.vy;
    this.opacity = this.maxOpacity * Math.max(0, 1 - age / this.life);
    return age < this.life;
  };

  MistParticle.prototype.draw = function () {
    if (this.opacity <= 0) return;
    // Soft radial gradient for a misty look instead of hard circles
    var grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    grad.addColorStop(0, "rgba(255,255,255," + (this.opacity * 0.8) + ")");
    grad.addColorStop(0.4, "rgba(255,255,255," + (this.opacity * 0.3) + ")");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  };

  /* ── Fog Rendering (offscreen canvas) ── */
  var fogOffscreen = document.createElement("canvas");
  var fogCtx = fogOffscreen.getContext("2d");
  var fogImageData = null;
  var fogW = 0, fogH = 0;

  function renderFog(targetCtx, targetW, targetH, time, density, mx, my, mouseInfluence) {
    var SCALE = ATMOSPHERE.FOG_SCALE;
    var fw = Math.ceil(targetW / SCALE);
    var fh = Math.ceil(targetH / SCALE);

    if (fogW !== fw || fogH !== fh) {
      fogW = fw;
      fogH = fh;
      fogOffscreen.width = fw;
      fogOffscreen.height = fh;
      fogImageData = fogCtx.createImageData(fw, fh);
    }

    var data = fogImageData.data;
    var ns = ATMOSPHERE.FOG_NOISE_SCALE;
    var ts = ATMOSPHERE.FOG_TIME_SCALE;
    var cmx = mx / SCALE;
    var cmy = my / SCALE;
    var clearR = ATMOSPHERE.FOG_CLEAR_RADIUS / SCALE;

    for (var y = 0; y < fh; y++) {
      for (var x = 0; x < fw; x++) {
        var n = SimplexNoise.fbm(
          x * ns + time * ts,
          y * ns + time * ts * 0.3,
          time * ts * 0.5,
          3, 0.5
        );

        var raw = clamp((n + 1) * 0.5, 0, 1);
        var alpha = raw * raw * density;

        if (mouseInfluence > 0) {
          var dx = x - cmx;
          var dy = y - cmy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var clearFactor = smoothstep(clearR, 0, dist);
          alpha *= 1 - clearFactor * 0.7 * mouseInfluence;
        }

        var idx = (y * fw + x) * 4;
        data[idx]     = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = (alpha * 255) | 0;
      }
    }

    fogCtx.putImageData(fogImageData, 0, 0);
    targetCtx.drawImage(fogOffscreen, 0, 0, targetW, targetH);
  }

  /* ── Hero Fog (separate canvas) ── */
  var heroFogCanvas = document.getElementById("hero-fog");
  var heroFogCtx = heroFogCanvas ? heroFogCanvas.getContext("2d") : null;
  var heroFogOffscreen = document.createElement("canvas");
  var heroFogOffCtx = heroFogOffscreen.getContext("2d");
  var heroFogImageData = null;
  var heroFogW = 0, heroFogH = 0;

  var heroW = 0, heroH = 0;

  function resizeHeroFog() {
    if (!heroFogCanvas) return;
    var parent = heroFogCanvas.parentElement;
    heroW = parent.offsetWidth;
    heroH = parent.offsetHeight;
    if (heroFogCanvas.width !== heroW || heroFogCanvas.height !== heroH) {
      heroFogCanvas.width = heroW;
      heroFogCanvas.height = heroH;
    }
  }

  function renderHeroFog(time) {
    if (!heroFogCtx || heroW === 0) return;
    if (window.scrollY > window.innerHeight * 1.5) return;

    heroFogCtx.clearRect(0, 0, heroW, heroH);
    var pw = heroW;
    var ph = heroH;

    var SCALE = ATMOSPHERE.FOG_SCALE;
    var fw = Math.ceil(pw / SCALE);
    var fh = Math.ceil(ph / SCALE);

    if (heroFogW !== fw || heroFogH !== fh) {
      heroFogW = fw;
      heroFogH = fh;
      heroFogOffscreen.width = fw;
      heroFogOffscreen.height = fh;
      heroFogImageData = heroFogOffCtx.createImageData(fw, fh);
    }

    var data = heroFogImageData.data;
    var ns = ATMOSPHERE.HERO_FOG_NOISE_SCALE;
    var driftSpeed = ATMOSPHERE.HERO_FOG_DRIFT_SPEED;
    var baseDensity = ATMOSPHERE.HERO_FOG_DENSITY;
    var pulseDensity = baseDensity * (0.85 + 0.15 * Math.sin(time * 0.3));

    for (var y = 0; y < fh; y++) {
      // Fog is present everywhere but denser toward the bottom (ground fog)
      var verticalGradient = 0.4 + 0.6 * smoothstep(fh * 0.1, fh * 0.6, y);
      for (var x = 0; x < fw; x++) {
        var n = SimplexNoise.fbm(
          x * ns + time * driftSpeed,
          y * ns + time * driftSpeed * 0.15,
          time * driftSpeed * 0.4,
          3, 0.5
        );

        // Map noise to fog density — use power curve for more distinct cloud patches
        var raw = clamp((n + 1) * 0.5, 0, 1);
        var alpha = raw * raw * pulseDensity * verticalGradient;

        var idx = (y * fw + x) * 4;
        data[idx]     = 255;
        data[idx + 1] = 255;
        data[idx + 2] = 255;
        data[idx + 3] = (alpha * 255) | 0;
      }
    }

    heroFogOffCtx.putImageData(heroFogImageData, 0, 0);
    heroFogCtx.drawImage(heroFogOffscreen, 0, 0, pw, ph);
  }

  /* ── Scroll-driven atmosphere parameters ── */
  var atmosphereKeyframes = [
    { at: 0.0,  starBright: 1.0, fogDensity: 0.32, bgTop: [12,17,22], bgBot: [22,25,39] },
    { at: 0.33, starBright: 0.7, fogDensity: 0.20, bgTop: [17,24,39], bgBot: [26,31,46] },
    { at: 0.66, starBright: 0.5, fogDensity: 0.36, bgTop: [15,21,32], bgBot: [21,28,42] },
    { at: 1.0,  starBright: 0.8, fogDensity: 0.24, bgTop: [17,21,32], bgBot: [26,28,40] },
  ];

  function getAtmosphereParams(progress) {
    var kf = atmosphereKeyframes;
    var lower = kf[0], upper = kf[kf.length - 1];
    for (var i = 0; i < kf.length - 1; i++) {
      if (progress >= kf[i].at && progress <= kf[i + 1].at) {
        lower = kf[i];
        upper = kf[i + 1];
        break;
      }
    }
    var range = upper.at - lower.at;
    var t = range === 0 ? 0 : (progress - lower.at) / range;
    return {
      starBrightness: lerp(lower.starBright, upper.starBright, t),
      fogDensity: lerp(lower.fogDensity, upper.fogDensity, t),
      bgTop: [
        Math.round(lerp(lower.bgTop[0], upper.bgTop[0], t)),
        Math.round(lerp(lower.bgTop[1], upper.bgTop[1], t)),
        Math.round(lerp(lower.bgTop[2], upper.bgTop[2], t))
      ],
      bgBot: [
        Math.round(lerp(lower.bgBot[0], upper.bgBot[0], t)),
        Math.round(lerp(lower.bgBot[1], upper.bgBot[1], t)),
        Math.round(lerp(lower.bgBot[2], upper.bgBot[2], t))
      ]
    };
  }

  /* ── Resize & Setup ── */
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    generateStars();
    resizeHeroFog();
  }

  function generateStars() {
    var count = Math.round((W * H) / ATMOSPHERE.STAR_DENSITY);
    stars = [];
    for (var i = 0; i < count; i++) stars.push(new Star(W, H));
  }

  function updateScrollProgress() {
    var maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  /* ── Main Render Loop ── */
  function render(now) {
    if (!isTabVisible) {
      requestAnimationFrame(render);
      return;
    }

    var timeSec = now / 1000;
    var params = getAtmosphereParams(scrollProgress);

    smoothMouseX = lerp(smoothMouseX, mouseX, ATMOSPHERE.PARALLAX_SMOOTHING);
    smoothMouseY = lerp(smoothMouseY, mouseY, ATMOSPHERE.PARALLAX_SMOOTHING);

    // Background gradient
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgb(" + params.bgTop[0] + "," + params.bgTop[1] + "," + params.bgTop[2] + ")");
    grad.addColorStop(1, "rgb(" + params.bgBot[0] + "," + params.bgBot[1] + "," + params.bgBot[2] + ")");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    var hw = W / 2, hh = H / 2;
    for (var i = 0; i < stars.length; i++) {
      if (!prefersReducedMotion) {
        stars[i].update(timeSec);
        stars[i].applyParallax(hw, hh, smoothMouseX, smoothMouseY);
      }
      stars[i].draw(params.starBrightness);
    }

    // Shooting stars
    if (!prefersReducedMotion && now >= nextShootingStar) {
      shootingStars.push(new ShootingStar());
      nextShootingStar = now + randomRange(ATMOSPHERE.SHOOTING_STAR_MIN_INTERVAL, ATMOSPHERE.SHOOTING_STAR_MAX_INTERVAL);
    }
    for (var j = shootingStars.length - 1; j >= 0; j--) {
      shootingStars[j].update();
      shootingStars[j].draw();
      if (shootingStars[j].isDead()) shootingStars.splice(j, 1);
    }

    // Global fog
    if (!prefersReducedMotion) {
      var idleTime = now - lastInteraction;
      var idleFogBoost = smoothstep(0, ATMOSPHERE.IDLE_THRESHOLD, idleTime) * 0.12;
      var effectiveFogDensity = params.fogDensity + idleFogBoost;
      renderFog(ctx, W, H, timeSec, effectiveFogDensity, smoothMouseX, smoothMouseY, 1.0);
    } else {
      // Reduced motion: draw a single static fog frame
      renderFog(ctx, W, H, 0, params.fogDensity * 0.5, W / 2, H / 2, 0);
    }

    // Hero fog
    if (!prefersReducedMotion) {
      renderHeroFog(timeSec);
    }

    // Cursor mist trail
    if (!prefersReducedMotion) {
      for (var k = mistParticles.length - 1; k >= 0; k--) {
        if (mistParticles[k].update(now)) {
          mistParticles[k].draw();
        } else {
          mistParticles.splice(k, 1);
        }
      }
    }

    requestAnimationFrame(render);
  }

  /* ── Event Listeners ── */
  window.addEventListener("resize", resize);
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("scroll", function () { lastInteraction = performance.now(); }, { passive: true });
  document.addEventListener("click", function () { lastInteraction = performance.now(); });

  document.addEventListener("visibilitychange", function () {
    isTabVisible = !document.hidden;
  });

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastInteraction = performance.now();

    if (!prefersReducedMotion && mistParticles.length < ATMOSPHERE.MIST_MAX_PARTICLES) {
      for (var i = 0; i < ATMOSPHERE.MIST_SPAWN_RATE; i++) {
        mistParticles.push(new MistParticle(e.clientX, e.clientY));
      }
    }
  });

  /* ── Init ── */
  resize();
  updateScrollProgress();
  requestAnimationFrame(render);
})();

/* ═══════════════════════════════════════
   Raindrop-on-Glass Effect
   (Removed — raindrop-fx renders opaque scenes incompatible with card overlays)
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   Navigation + Scroll Animations
   ═══════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function () {
  // ── Smooth scroll navigation ──
  document.querySelectorAll(".vertical-navbar a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, null, this.getAttribute("href"));
      }
    });
  });

  // ── Active nav indicator via IntersectionObserver ──
  var sections = document.querySelectorAll("section, .landing-page");
  var navLinks = document.querySelectorAll(".vertical-navbar a");

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + id
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // ── Scroll-triggered entrance animations ──
  var animObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll("section").forEach(function (s) {
    animObserver.observe(s);
  });

  // ── Deep link support ──
  if (window.location.hash) {
    var hashTarget = document.querySelector(window.location.hash);
    if (hashTarget) {
      setTimeout(function () {
        hashTarget.scrollIntoView();
      }, 100);
    }
  }

  /* ═══════════════════════════════════════
     Portfolio — Info Card Modals
     ═══════════════════════════════════════ */
  function openInfoCard(cardId) {
    var card = document.getElementById(cardId);
    var backdrop = document.getElementById("infoCardBackdrop");
    if (!card || !backdrop) return;
    backdrop.style.display = "block";
    card.style.display = "flex";
    setTimeout(function () {
      backdrop.classList.add("visible");
      card.classList.add("visible");
    }, 50);
    backdrop.onclick = function () {
      closeInfoCard(cardId);
    };
  }

  function closeInfoCard(cardId) {
    var card = document.getElementById(cardId);
    var backdrop = document.getElementById("infoCardBackdrop");
    if (!card || !backdrop) return;
    card.classList.remove("visible");
    backdrop.classList.remove("visible");
    setTimeout(function () {
      card.style.display = "none";
      backdrop.style.display = "none";
    }, 500);
  }

  // Learn More buttons → open info card
  document.querySelectorAll(".btn-learn-more").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var box = this.closest(".box");
      if (box && box.dataset.card) {
        openInfoCard(box.dataset.card);
      }
    });
  });

  // Close buttons inside info cards
  document.querySelectorAll(".close-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = this.closest(".info-card");
      if (card) closeInfoCard(card.id);
    });
  });

  // Close info card on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".info-card.visible").forEach(function (card) {
        closeInfoCard(card.id);
      });
    }
  });

  // Touch toggle for portfolio cards on mobile
  if ("ontouchstart" in window) {
    document.querySelectorAll(".box").forEach(function (box) {
      box.addEventListener("click", function (e) {
        if (e.target.closest(".btn-learn-more")) return;
        document.querySelectorAll(".box.touch-active").forEach(function (b) {
          if (b !== box) b.classList.remove("touch-active");
        });
        this.classList.toggle("touch-active");
      });
    });
  }

  /* ═══════════════════════════════════════
     Contact Form Submission
     ═══════════════════════════════════════ */
  function showNotification(message, isSuccess) {
    var el = document.getElementById("notification-window");
    var msg = document.getElementById("notification-message");

    msg.textContent = message;
    el.className =
      "notification-window " +
      (isSuccess ? "notification-success" : "notification-error");
    el.style.display = "block";
    el.style.top = "-5px";

    setTimeout(function () {
      el.style.top = "-100px";
      setTimeout(function () {
        el.style.display = "none";
      }, 500);
    }, 5000);
  }

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
      };

      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.text();
        })
        .then(function () {
          document.getElementById("name").value = "";
          document.getElementById("email").value = "";
          document.getElementById("message").value = "";
          showNotification("Email sent successfully!", true);
        })
        .catch(function () {
          showNotification(
            "Failed to send email. Please try again later.",
            false
          );
        });
    });
  }
});
