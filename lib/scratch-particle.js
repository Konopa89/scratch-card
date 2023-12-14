let canvas, settings = {width: 0, height: 0, scale: 1};

/** @type { CanvasRenderingContext2D } */
let ctx;

/**
 *  @typedef {{
 *  created: Date,
 *  lifetime: number,
 *  speed: number,
 *  fill: string,
 *  fillOffset: number,
 *  position: {
 *    x: number,
 *    y: number,
 *  },
 *  velocity: {
 *    x: number,
 *    y: number,
 *  }
 * }} Particle
 *
 */

/** @type {Particle[]} */
const particles = [];

/** @type {Particle[]} */
const particleBuffer = [];

const update = () => {
  const now = new Date();

  Object.assign(canvas, settings);
  ctx.scale(settings.scale, settings.scale);

  for (let i = 0, p, pec; i < particles.length; i++) {
    p = particles[i];

    if ((now - p.created) > p.lifetime) {
      particleBuffer.push(particles.splice(i--, 1)[0]); 
      
      continue;
    }

    p.position.x += p.velocity.x * p.speed;
    p.position.y += p.velocity.y * p.speed;
    p.speed      *= 0.98;

    pec = 1 - ((now - p.created) / p.lifetime);

    ctx.beginPath();

    ctx.fillStyle = p.fill;

    const fill  = parseInt(ctx.fillStyle.substring(1), 16),
          clamp = (v) => Math.min(Math.max(0, v), 255),
          r     = (fill >> 16) & 0xFF,
          g     = (fill >> 8)  & 0xFF,
          b     = fill         & 0xFF,
          d     = p.fillOffset;

    ctx.fillStyle = `rgba(${clamp(r + d)}, ${clamp(g + d)}, ${clamp(b + d)}, ${pec})`;

    ctx.fillRect(p.position.x, p.position.y, 1 / settings.scale, 1 / settings.scale);

    ctx.closePath();
  }

  if (particles.length) {
    requestAnimationFrame(update);
  }
}

onmessage = (message) => {

  if (message.data instanceof OffscreenCanvas) {
    canvas = message.data;    
    ctx    = canvas.getContext('2d');
    return;
  } 

  const particleCount = 4, 
        wasEmpty      = particles.length == 0,
        maxParticles  = 5000;

  if (particles.length >= maxParticles) {
    return;
  }

  Object.assign(settings, message.data.size);

  settings.scale = message.data.scale;

  for (let i = 0; i < particleCount; i++) {

    const x = -0.5 + Math.random(),
          y = -0.5 + Math.random();

    const particle = particleBuffer.length ? particleBuffer.pop() : {
      position: {x, y},
      velocity: {x, y}
    };

    particle.created    = new Date();
    particle.lifetime   = 1500;
    particle.fillOffset = (-0.5 + Math.random()) * 100,
    particle.speed      = Math.random() * 1.5;
    particle.fill       = message.data.fill;
    particle.position.x = message.data.position.x + x * message.data.offset;
    particle.position.y = message.data.position.y + y * message.data.offset;

    particles.push(particle);
  }

  if (wasEmpty) {
    update();
  }
}
