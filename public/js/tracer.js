class Visualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.xInputs = [];
        this.yInputs = [];
        this.fourierX = [];
        this.fourierY = [];
        this.mousedown = false;
        this.yOffset = 3 * this.canvas.width / 8;
        this.xOffset = 3 * this.canvas.height / 8;
        this.speed = 20;
        // Used to keep track of points traced by the Fourier transform
        this.xtrace = [];
        this.ytrace = [];
        this.xmouseoffset = -this.canvas.width / 2;
        this.ymouseoffset = -this.canvas.height / 2 - 120;
        this.isAnimating = false;

        this.reset = false;

        // Translate (0, 0) to the center of the canvas
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    }

    drawLine(x0, y0, x1, y1, color="#000000", thickness=2) {
        this.ctx.beginPath();
        this.ctx.lineWidth = thickness;
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

    drawCircle(x, y, r, color="#000000", thickness=2) {
        this.ctx.beginPath();
        this.ctx.lineWidth = thickness;
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

    drawInput(last=true, color="#000000", thickness=2) {
        this.ctx.beginPath();
        let x0;
        let y0;
        let x1;
        let y1;
        this.ctx.lineWidth = thickness;
        for (let i = 1; i < this.xInputs.length; i++) {
            x0 = this.xInputs[i-1];
            y0 = this.yInputs[i-1];
            x1 = this.xInputs[i];
            y1 = this.yInputs[i];
            this.ctx.strokeStyle = color;
            this.ctx.moveTo(x0, y0);
            this.ctx.lineTo(x1, y1);
        }
        this.ctx.stroke();
        if (last) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(this.xInputs[0], this.yInputs[0]);
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }
    }

    drawTrace(r, g, b, thickness) {
        for (let i = 1; i < Math.min(this.xtrace.length, 50); i++) {
            let x0 = this.xtrace[i-1];
            let y0 = this.ytrace[i-1];
            let x1 = this.xtrace[i];
            let y1 = this.ytrace[i];
            this.ctx.beginPath();
            this.ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + (1 - 0.015 * i);
            this.ctx.moveTo(x0, y0);
            this.ctx.lineTo(x1, y1);
            this.ctx.lineWidth = thickness;
            this.ctx.stroke();
        }
        for (let i = 50; i < this.xtrace.length; i++) {
            let x0 = this.xtrace[i-1];
            let y0 = this.ytrace[i-1];
            let x1 = this.xtrace[i];
            let y1 = this.ytrace[i];
            this.ctx.beginPath();
            this.ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + (1 - 0.015 * 50);
            this.ctx.moveTo(x0, y0);
            this.ctx.lineTo(x1, y1);
            this.ctx.lineWidth = thickness;
            this.ctx.stroke();
        }
    }

    clearCanvas() {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.restore();
    }

    resetAll() {
        this.xInputs = [];
        this.yInputs = [];
        this.fourierX = [];
        this.fourierY = [];
        this.xtrace = [];
        this.ytrace = [];
        this.isAnimating = false;
        this.clearCanvas();
    }

    animate() {
        if (this.xInputs.length < 2) {
            window.alert("Please draw something");
            return null;
        }
        this.reset = false;
        this.isAnimating = true;

        this.fourierX = discreteFourier(this.xInputs);
        this.fourierY = discreteFourier(this.yInputs);
        const dt = Math.PI * 2 / this.fourierX.length;
        let time = 0;

        let animate1 = setInterval(() => {
            if (this.reset) {
                clearInterval(animate1);
            }

            let yx = -this.yOffset;
            let yy = 0;
            let xx = 0;
            let xy = -this.xOffset;

            // Clear canvas
            this.clearCanvas();

            for (let i = 0; i < this.fourierX.length; i++) {
                let prevyx = yx;
                let prevyy = yy;

                let prevxx = xx;
                let prevxy = xy;

                let yfreq = this.fourierY[i].freq;
                let yradius = this.fourierY[i].amp;
                let yphase = this.fourierY[i].phase;
                yx += yradius * Math.cos(yfreq * time + yphase + Math.PI / 2);
                yy += yradius * Math.sin(yfreq * time + yphase + Math.PI / 2);

                let xfreq = this.fourierX[i].freq;
                let xradius = this.fourierX[i].amp;
                let xphase = this.fourierX[i].phase;
                xx += xradius * Math.cos(xfreq * time + xphase);
                xy += xradius * Math.sin(xfreq * time + xphase);

                this.drawCircle(prevyx, prevyy, yradius);
                this.drawLine(prevyx, prevyy, yx, yy);

                this.drawCircle(prevxx, prevxy, xradius);
                this.drawLine(prevxx, prevxy, xx, xy);
            }

            this.drawLine(yx, yy, xx, yy);
            this.drawLine(xx, xy, xx, yy);

            if (this.xtrace.length <= this.xInputs.length) {
                this.xtrace.unshift(xx);
                this.ytrace.unshift(yy);
            } else {
                this.xtrace.unshift(xx);
                this.ytrace.unshift(yy);
                this.xtrace.pop();
                this.ytrace.pop();
            }

            this.drawInput(false);
            this.drawTrace(255, 0, 0, 5);

            time += dt;
        }, this.speed);
    }
}

// Takes in an array of values
// Outputs an array of objects that represent the discrete fourier transform of the array
// Each object contains the real part, imaginary part, frequency, amplitude, and phase of each circle
// See https://en.wikipedia.org/wiki/Discrete_Fourier_transform
function discreteFourier(x) {
    let X = [];
    const N = x.length;

    for (let k = 0; k < N; k++) {
        let re = 0;
        let im = 0;
        for (let n = 0; n < N; n++) {
            const theta = (2 * Math.PI * k * n) / N;
            re += x[n] * Math.cos(theta);
            im -= x[n] * Math.sin(theta);
        }
        re = re / N;
        im = im / N;

        let freq = k;
        let amp = Math.sqrt(re * re + im * im);
        let phase = Math.atan2(im, re);

        X[k] = {re, im, freq, amp, phase};
    }

    return X;
}

function displayModal() {
    // Get the modal
    var modal = document.getElementById("vismodal");

    // Get the button
    var btn = document.getElementById("intro");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function main() {
    const CANVAS = document.getElementById('visualizer');

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight - 120;

    let vis = new Visualizer(CANVAS);

    // Button to start visualization
    let startVis = document.getElementById('start-vis');
    // Button for resetting
    let resetButton = document.getElementById('reset');

    function mousedownac(e) {
        vis.mousedown = true;
        if (!vis.isAnimating) {
            vis.xInputs.push(e.clientX + vis.xmouseoffset);
            vis.yInputs.push(e.clientY + vis.ymouseoffset);
        }
    }
    function mousemove(e) {
        if (vis.mousedown && (!vis.isAnimating)) {
            vis.clearCanvas();
            vis.xInputs.push(e.clientX + vis.xmouseoffset);
            vis.yInputs.push(e.clientY + vis.ymouseoffset);
            vis.drawInput(false);
        }
    }
    function mouseup(e) {
        if (!vis.isAnimating) {
            vis.mousedown = false;
            vis.clearCanvas();
            vis.drawInput(false);
        }
    }
    function mouseout(e) {
        vis.mousedown = false;
    }
    function listen() {
        vis.canvas.addEventListener("mousedown", mousedownac);
        vis.canvas.addEventListener("mouseup", mouseup);
        vis.canvas.addEventListener("mousemove", mousemove);
        vis.canvas.addEventListener("mouseout", mouseout);
    }
    function reset() {
        vis.resetAll();
    }

    startVis.addEventListener('click', e => {
        if (!vis.isAnimating) {
            vis.animate();
        }
    });
    resetButton.addEventListener('click', e => {
        vis.reset = true;
        setTimeout(reset, 50);
    })

    listen();
}

main();

displayModal();
