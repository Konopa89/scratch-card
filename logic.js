class ScratchCard extends HTMLElement {
  img    = new Image();
  canvas = document.createElement("canvas");
  canvasGradiant = document.createElement("canvas")
  span = document.createElement("span");
  style = document.createElement("style");
  gyro = { x: 0, y: 0, dx: 200, dy: 200 };
  isDrawing = false;
  ctx = this.canvas.getContext("2d", { desynchronized: true });
  ctxGradient = this.canvasGradiant.getContext("2d");

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

    addEventListener('mousedown', (ev) => this.startDrawing(ev));
    addEventListener('mousemove', (ev) => this.draw(ev));
    addEventListener('touchmove', (ev) => this.draw(ev));
    addEventListener('mouseup', (ev) => this.stopDrawing(ev));

    window.addEventListener("deviceorientation", (event) => {
      let multiplikator = 4,
          g = Math.round((event.gamma + 180) / 10) * 10;

      this.gyro.x  =  -g * multiplikator;

      //this.gyro.y1 = -event.beta * multiplikator;
      //this.gyro.x1 = -event.gamma * multiplikator;

      document.querySelector('pre').textContent = JSON.stringify({
        alpha: Math.round(event.alpha),
        beta: Math.round(event.beta), 
        gamma: Math.round(g)
      }, null, 2);
     // this.gyro.y  = event.beta  * multiplikator;
    //  this.gyro.dx = event.gamma * multiplikator;
      this.#shine(this.gyro.x, this.gyro.y, this.gyro.dx, this.gyro.dy);

    })
    //this.addEventListener('mousedown', hideIt, {once: true});

    this.style.innerHTML = `
          :host {
            display: grid;
            place-content: center;
            place-items: center;
            border: solid 1px blue;
            position: relative;
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
    this.shadowRoot.append(this.span, this.canvas, this.style, this.canvasGradiant);

    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.canvasGradiant.width = this.canvasGradiant.offsetWidth;
    this.canvasGradiant.height = this.canvasGradiant.offsetHeight;

    // this.grd = this.ctx.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 1, this.canvas.width / 2, this.canvas.height / 2, 150);
    // this.grd.addColorStop(0, "rgb(56,56,56)");
    // this.grd.addColorStop(1, "rgb(136,136,136)");
    // this.ctx.fillStyle = this.grd;
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.#shine(this.gyro.x, this.gyro.y, this.gyro.dx, this.gyro.dy);

    //this.#draw();

    // this.addEventListener("touchmove", (move) => {
    //     console.log(move.targetTouches.clientX)

    // })
    // this.addEventListener("mousemove", (e) => this.#erase(e));
  }

  get code() {
    return this.getAttribute('code');
  }

  get scratchWord() {
    return this.getAttribute('scratch-word');
  }

  draw(e) {
    if (!this.isDrawing) return;

    function changePenSize(min = 3, max = 12) {
      return Math.floor(Math.random() * (max - min) + min);
    }

    let penSize = changePenSize();

    this.ctx.lineWidth = penSize;
    this.ctx.shadowColor = "white";
    this.ctx.shadowBlur = "5";
    this.ctx.lineCap = 'round';


    const x = e.clientX - this.canvas.getBoundingClientRect().left;
    const y = e.clientY - this.canvas.getBoundingClientRect().top;

    if (this.isDrawing) {
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
    }

    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.drawImage(this.img, 0, 0, this.canvasGradiant.width, this.canvasGradiant.height)


  }

  startDrawing(e) {
    this.isDrawing = true;
    this.ctx.globalCompositeOperation = 'destination-out';
    this.draw(e);
  }
  stopDrawing() {
    this.isDrawing = false;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.beginPath();
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