export default class Mouse {
  constructor(canvas, handler) {
    this.canvas = canvas;
    this.oldX = 0;
    this.oldY = 0;
    this.currRadX = 0;
    this.currRadY = 0;
    this.mouseDown = false;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.handler = handler;
    console.log("hi");
    canvas.addEventListener('mousedown', (e) => {
      const { x, y } = Mouse.readPos(e, this.canvas);
      this.oldX = x;
      this.oldY = y;
      this.mouseDown = true;
    }, false);

    canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
    }, false);

    canvas.addEventListener('mousemove', this.onMouseMove, false);
  }

  onMouseMove(e) {
    if (!this.mouseDown) return;

    const { x, y } = Mouse.readPos(e, this.canvas);

    const dx = x - this.oldX,
      dy = y - this.oldY;
    const dradX = 2 * Math.PI / this.canvas.width * dx,
        dradY = 2 * Math.PI / this.canvas.height * dy;
    this.currRadX += dradX;
    this.currRadY += dradY;

    if (this.currRadX > 3.14) this.currRadX = -3.14;
    else if (this.currRadX < -3.14) this.currRadX = 3.14;
    if (this.currRadY > 3.14) this.currRadY = -3.14;
    else if (this.currRadY < -3.14) this.currRadY = 3.14;
    
    this.oldX = x;
    this.oldY = y;

    this.handler(this.currRadY, this.currRadX);
  }

  static readPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
      y: (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
  }
}
