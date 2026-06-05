/**
 * TIC-TAC-TOE | Canvas Confetti & Particle Celebrations
 * 
 * High-performance, lightweight particle engine that runs on a single overlaid Canvas.
 * Automatically cleans up its rendering loop when all particles have faded.
 */

const ParticleSystem = (function() {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animationFrameId = null;

  /**
   * Lazy-initialize the canvas element on the first burst
   */
  function init() {
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  /**
   * Keep canvas size synchronized with viewport
   */
  function resizeCanvas() {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  /**
   * Individual confetti particle representation
   */
  class ConfettiParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 4; // size in px
      this.color = color;
      
      // Velocity vectors (radial dispersion with upward burst)
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      this.speedX = Math.cos(angle) * speed;
      this.speedY = Math.sin(angle) * speed - 5; // offset upward
      
      this.gravity = 0.25;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.opacity = 1;
      this.fadeSpeed = 0.01 + Math.random() * 0.01;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.fadeSpeed;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      
      // Draw rectangular confetti particle
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.opacity);
      
      // Draw glow matching the color
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  /**
   * Main animation loop
   */
  function loop() {
    // Check if prefers-reduced-motion is active
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      particles = [];
      if (canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      animationFrameId = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles = particles.filter(p => p.opacity > 0);
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  /**
   * Trigger a burst of particles from a specific coordinate
   * @param {number} x - Client X coordinate
   * @param {number} y - Client Y coordinate
   * @param {string[]} colors - Colors hex/rgb array
   * @param {number} count - Number of particles
   */
  function burst(x, y, colors = ['#00d4ff', '#ff6b9d', '#00ff88', '#fbbf24'], count = 80) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Silent skip for accessibility

    init();
    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particles.push(new ConfettiParticle(x, y, color));
    }

    if (!animationFrameId) {
      loop();
    }
  }

  return {
    burst: burst
  };
})();

// Attach to global window object
window.ParticleSystem = ParticleSystem;
