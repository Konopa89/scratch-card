class ScratchCard extends HTMLElement {
  img    = new Image();
  canvas = document.createElement("canvas");
  canvasGradiant = document.createElement("canvas")
  span = document.createElement("span");
  gyro = { x: 0, y: 0, dx: 200, dy: 200 };
  isDrawing = false;
  ctx = this.canvas.getContext("2d", { desynchronized: true });
  ctxGradient = this.canvasGradiant.getContext("2d");
  pointer = {x: 0, y: 0};

  static get observedAttributes() {
    return ['code', 'scratch-word'];
  }

  attributeChangedCallback() {
    this.span.textContent = this.code;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    window.addEventListener("load", () => {
      this.img.src = "test.png";
    })

    const getPoint = (e) => {
      const bbox = this.canvas.getBoundingClientRect();

      return {
        x: e.clientX - bbox.left,
        y: e.clientY - bbox.top
      };
    }

    this.addEventListener('mousemove', (e) => {
      const p = getPoint(e);
  
      if (e.buttons) {
        this.draw(p.x, p.y);
      }

      Object.assign(this.pointer, p);
    });

    this.addEventListener('touchstart', (e) => {
      
      for (const touch of e.targetTouches) {
        Object.assign(this.pointer, getPoint(touch));
        break;
      }  

    });

    this.addEventListener('touchmove', (e) => {
      
      for (const touch of e.targetTouches) {
        const p = getPoint(touch);

        this.draw(p.x, p.y);

        Object.assign(this.pointer, p);

        return;
      }  

    });

    window.addEventListener("deviceorientation", (event) => {
      const b = Math.round(180 + event.beta) / 360,
            g = Math.round(180 + event.gamma) / 360;

      this.style.setProperty('--gloss-x', ((1 - g) * 50) + '%');
      this.style.setProperty('--gloss-y', ((1 - b) * 50) + '%');
      
      document.querySelector('pre').textContent = JSON.stringify({
        alpha: Math.round(event.alpha),
        beta: Math.round(event.beta), 
        gamma: Math.round(event.gamma)
      }, null, 2);
      
     // this.#shine(this.gyro.x, this.gyro.y, this.gyro.dx, this.gyro.dy);
    })

    const style = document.createElement("style");

    style.innerHTML = `
      :host {
        display: grid;
        place-content: center;
        place-items: center;
        border: solid 1px blue;
        position: relative;
        overflow: clip;
      }

      :host::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 45%, rgba(255,255,255,1) 55%, rgba(255,255,255,0) 100%) repeat center/contain;
        transform: scale(2) translate(var(--gloss-x, 0), var(--gloss-y, 0));
        mix-blend-mode: overlay;
      }

      span {
        text-transform: uppercase;
        font-size: 4em;
        letter-spacing: 0.25em;
        pointer-events: none;
        user-select: none;
      }

      canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
    `;

    this.shadowRoot.append(this.span, this.canvas, style, this.canvasGradiant);

    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.#foil();
  }

  get code() {
    return this.getAttribute('code');
  }

  get scratchWord() {
    return this.getAttribute('scratch-word');
  }

  /** @param { MouseEvent } e  */
  draw(x, y) {   
    this.ctx.lineWidth = Math.floor(Math.random() * (7 - 4) + 4);
    this.ctx.shadowColor = "white";
    this.ctx.shadowBlur = "2";

    const vec    = new Vec2(x -this.pointer.x, y - this.pointer.y),
          length = vec.length();

    vec.normalize();
    
    for (let offset = 0; offset < length; offset += 5) {
      const p = vec.multiply(offset).add(this.pointer.x, this.pointer.y);
      
      const r = () => (-0.5 + Math.random()) * (this.ctx.lineWidth + 15);
    
      this.ctx.beginPath();
      this.ctx.globalCompositeOperation = 'destination-out';

      this.ctx.moveTo(p.x + r(), p.y + r());

      for( let i = 0; i < 50; i++ ) {
        this.ctx.lineTo(p.x + r(), p.y + r());
      }
      
      this.ctx.closePath();
      this.ctx.fill();
    }
  }

  #foil() {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#666';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height),
          r     = () => (-0.5 + Math.random()) * 15,
          clamp = (v) => Math.min(Math.max(0, v), 255);

    for (let i = 0; i < image.data.length; i += 4) {
      const noise = r();

      image.data[i]     = clamp(image.data[i] + noise);
      image.data[i + 1] = clamp(image.data[i + 1] + noise);
      image.data[i + 2] = clamp(image.data[i + 2] + noise);
    }

    this.ctx.putImageData(image, 0, 0);

    this.ctx.closePath();
  }

  #shine(x, y, dx, dy) {
    const gradient  = this.ctx.createLinearGradient(-this.canvas.width * 3, 0 , x + this.canvas.width * 3, this.canvas.height * 5),
          gradient2 = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);

    const stops = 100;

    for (let i = 0; i < stops; i++) {
      if ((i % 2) == 0) gradient.addColorStop(i / stops, "rgba(255, 0, 0, 0.75)");
      if ((i % 3) == 0) gradient.addColorStop(i / stops, "rgba(0, 0, 0, 0.0)");
      if ((i % 4) == 0) gradient.addColorStop(i / stops, "rgba(0, 255, 0, 0.75)");
    }

    gradient2.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient2.addColorStop(1 - ((x + 1800) / 3600), "rgba(255,255,255, 0.8)");
    gradient2.addColorStop(1 - ((x + 1800) / 3600), "rgba(255,255,255, 0.8)");
    gradient2.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = gradient2;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }


}

customElements.define('scratch-card', ScratchCard);


class Vec2 {
  x = 0;
  y = 0;

  constructor(x,y) {
    this.x = x;
    this.y = y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.length();

    this.x /= len;
    this.y /= len;
  }

  multiply(fac) {
    return new Vec2(this.x * fac, this.y * fac);
  }

  add(x, y) {
    return new Vec2(this.x + x, this.y + y);
  }
}