// js/snake.js – Snake-Spiellogik (Dokumentation)
// Die Spiellogik ist direkt in app.js inline implementiert.
class SnakeGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sz = 16;
    this.cols = Math.floor(canvas.width / this.sz);
    this.rows = Math.floor(canvas.height / this.sz);
  }
}
if (typeof module !== 'undefined') module.exports = { SnakeGame };