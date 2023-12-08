/* define Canvas */

var   ticket       = document.getElementById('js-ticket'),
      canvas       = document.getElementById('js-canvas'),
      canvasWidth  = canvas.width,
      canvasHeight = canvas.height,
      ctx          = canvas.getContext('2d');
      


/* color Canvas */

var grd = ctx.createRadialGradient(canvasWidth / 2, canvasHeight / 2, 1, canvasWidth / 2, canvasHeight / 2, 150);
grd.addColorStop(0, "rgb(56,56,56)");
grd.addColorStop(1, "rgb(136,136,136)");
ctx.fillStyle = grd;
ctx.fillRect(0, 0, canvasWidth, canvasHeight)

/* Event listener */

let isDrawing = false;
addEventListener('mousedown', startDrawing);
addEventListener('mousemove', draw);
addEventListener('touchmove', draw);
addEventListener('mouseup', stopDrawing);
ticket.addEventListener('mousedown', hideIt, {once: true});

/* drawing functions */
function startDrawing(e) {
    isDrawing = true;
    ctx.globalCompositeOperation = 'destination-out';
    draw(e); 
}

function draw(e) {
    if (!isDrawing) return;
    
    function changePenSize(min = 3, max = 6) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    let penSize = changePenSize();

    ctx.lineWidth = penSize;
    ctx.shadowColor = "white";
    ctx.shadowBlur = "5";
    ctx.lineCap = 'round';

   
    const x = e.clientX - canvas.getBoundingClientRect().left;
    const y = e.clientY - canvas.getBoundingClientRect().top;

    if (isDrawing) {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function stopDrawing() {
    isDrawing = false;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); 
}
/* hide function */
function hideIt(){
    document.getElementById("hand").style.display = "none";
}


