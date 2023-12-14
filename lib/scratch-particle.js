let canvas, settings = {width: 0, height: 0, scale: 1};

/** @type { CanvasRenderingContext2D } */
let ctx;

/**
 * @type {{
 *  created: Date,
 *  lifetime: number,
 *  speed: number,
 *  fill: string,
 *  position: {
 *    x: number,
 *    y: number,
 *  },
 *  velocity: {
 *    x: number,
 *    y: number,
 *  }
 * }[]}
 */
const particles = [];

const update = () => {
  const now = new Date();

  Object.assign(canvas, settings);
  ctx.scale(settings.scale, settings.scale);

  for (let i = 0, p, pec; i < particles.length; i++) {
    p = particles[i];

    if ((now - p.created) > p.lifetime) {
      particles.splice(i--, 1); 
      
      continue;
    }

    p.position.x += p.velocity.x * p.speed;
    p.position.y += p.velocity.y * p.speed;

    p.velocity.x *= 0.98;
    p.velocity.y *= 0.98;

    pec = 1 - ((now - p.created) / p.lifetime);

    ctx.beginPath();

    ctx.fillStyle = p.fill;

    const fill = parseInt(ctx.fillStyle.substring(1), 16),
          r    = (fill >> 16) & 0xFF,
          g    = (fill >> 8)  & 0xFF,
          b    = fill         & 0xFF,
          fac  = 0.6;

    ctx.fillStyle   = `rgb(${r * fac}, ${g * fac}, ${b * fac})`;
    ctx.globalAlpha = pec;

    ctx.fillRect(p.position.x, p.position.y, 1, 1);

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

  const particleCount = 5, 
        wasEmpty      = particles.length == 0;

  Object.assign(settings, message.data.size);

  settings.scale = message.data.scale;

  for (let i = 0; i < particleCount; i++) {
    
    const dir = {
      x: -0.5 + Math.random(),
      y: -0.5 + Math.random(),
    };

    particles.push({
      created: new Date(),
      lifetime: 1000,
      speed: Math.random(),
      fill: message.data.fill,
      position: {
        x: message.data.position.x + dir.x * message.data.offset,
        y: message.data.position.y + dir.y * message.data.offset
      },
      velocity: dir
    });
  }

  if (wasEmpty) {
    update();
  }
}
