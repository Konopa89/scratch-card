class ScratchCard extends HTMLElement {
  canvas = document.createElement("canvas");
  span = document.createElement("span");
  style = document.createElement("style");
  gyro = { x: 0, y: 0, dx: 200, dy: 200 };
  isDrawing = false;
  ctx = this.canvas.getContext("2d", { desynchronized: true });

  static get observedAttributes() {
    return ['code', 'scratch-word'];
  }

  attributeChangedCallback() {
    this.span.textContent = this.code;
  }

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    addEventListener('mousedown', (ev) => this.startDrawing(ev));
    addEventListener('mousemove', (ev) => this.draw(ev));
    addEventListener('touchmove', (ev) => this.draw(ev));
    addEventListener('mouseup', (ev) => this.stopDrawing(ev));

    window.addEventListener("deviceorientation", (event) => {
      let multiplikator = 1;
      
      this.gyro.x  = event.alpha * multiplikator;
      this.gyro.y  = event.beta  * multiplikator;
      this.gyro.dx = event.gamma * multiplikator;
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
          }

          canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
          }
        `;
    this.shadowRoot.append(this.span, this.canvas, this.style);

    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

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
    const gradient = this.ctx.createLinearGradient(x, y, dx, dy);
    gradient.addColorStop(0, "rgba(255, 0, 0, 0.5)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.0)");
    gradient.addColorStop(1, "rgba(0, 255, 0, 0.5)");

    this.ctx.fillStyle = "gray";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }


}

customElements.define('scratch-card', ScratchCard);