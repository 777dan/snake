// Настройка элемента холста canvas
const canvas = document.getElementById("canvas");
const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];

class Block {
  constructor(canvas, col = 0, row = 0, blockSize = 10, colors = ["Blue"]) {
    this.context = canvas.getContext("2d");
    this.col = col;
    this.row = row;
    this.colors = colors;
    this.blockSize = blockSize;
  }
  drawSquare = function (color = "blue") {
    let x = this.col * this.blockSize;
    let y = this.row * this.blockSize;
    this.context.fillStyle = color;
    this.context.fillRect(x, y, this.blockSize, this.blockSize);
  };

  drawCircle = function (color = "LimeGreen") {
    let centerX = this.col * this.blockSize + this.blockSize / 2;
    let centerY = this.row * this.blockSize + this.blockSize / 2;
    this.context.fillStyle = color;
    this.circle(centerX, centerY, this.blockSize / 2, true);
  };

  circle = function (x, y, radius, fillCircle) {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillCircle) {
      this.context.fill();
    } else {
      this.context.stroke();
    }
  };

  equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row;
  };
}

class Apple {
  constructor(canvas) {
    this.block = new Block(canvas, 20, 20);
    this.color = "LimeGreen";
    this.canvas = canvas;
  }

  draw = function () {
    this.block.drawCircle("LimeGreen");
  };

  move = function () {
    const widthInBlocks = this.canvas.width / this.block.blockSize;
    const heightInBlocks = this.canvas.height / this.block.blockSize;
    let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
    let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
    this.block = new Block(canvas, randomCol, randomRow);
  };
}

class Snake {
  constructor(canvas) {
    this.segments = [
      new Block(canvas, 7, 5),
      new Block(canvas, 6, 5),
      new Block(canvas, 5, 5),
    ];
    this.direction = "right";
    this.nextDirection = "right";
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.canvas = canvas;
  }

  draw = function () {
    for (let i = 0; i < this.segments.length; i++) {
      this.segments[i].drawSquare(this.color);
    }
  };

  move = function (apple, game) {
    let head = this.segments[0];
    let newHead;
    this.direction = this.nextDirection;
    if (this.direction === "right") {
      newHead = new Block(this.canvas, head.col + 1, head.row);
    } else if (this.direction === "down") {
      newHead = new Block(this.canvas, head.col, head.row + 1);
    } else if (this.direction === "left") {
      newHead = new Block(this.canvas, head.col - 1, head.row);
    } else if (this.direction === "up") {
      newHead = new Block(this.canvas, head.col, head.row - 1);
    }

    if (this.checkCollision(newHead)) {
      game.gameOver();
     // alert("game Over!");
      return;
    }
    this.segments.unshift(newHead);

    if (newHead.equal(apple.block)) {
      game.score++;
      apple.move();
    } else {
      this.segments.pop();
    }
  };

  checkCollision = function (head) {
    const leftCollision = head.col === 0;
    const topCollision = head.row === 0;
    const widthInBlocks = this.canvas.width / this.segments[0].blockSize;
    const heightInBlocks = this.canvas.height / this.segments[0].blockSize;
    const rightCollision = head.col === widthInBlocks - 1;
    const bottomCollision = head.row === heightInBlocks - 1;
    const wallCollision =
      leftCollision || topCollision || rightCollision || bottomCollision;
    let selfCollision = false;
    for (let i = 0; i < this.segments.length; i++) {
      if (head.equal(this.segments[i])) {
        selfCollision = true;
      }
    }
    return wallCollision || selfCollision;
  };

  setDirection = function (newDirection) {
    if (this.direction === "up" && newDirection === "down") {
      return;
    } else if (this.direction === "right" && newDirection === "left") {
      return;
    } else if (this.direction === "down" && newDirection === "up") {
      return;
    } else if (this.direction === "left" && newDirection === "right") {
      return;
    }
    this.nextDirection = newDirection;
  };
}

class Game {
  intervalId;
  constructor(canvas) {
    this.context = canvas.getContext("2d");
    this.canvas = canvas;
    this.score = 0;
    this.directions = {
      37: "left",
      38: "up",
      39: "right",
      40: "down",
    };
    this.apple = new Apple(canvas);
    this.snake = new Snake(canvas);
  }

  drawBorder = function (blockSize = 10) {
    this.context.fillStyle = "Gray";
    this.context.fillRect(0, 0, this.canvas.width, blockSize);
    this.context.fillRect(
      0,
      this.canvas.height - blockSize,
      this.canvas.width,
      blockSize
    );
    this.context.fillRect(0, 0, blockSize, this.canvas.height);
    this.context.fillRect(
      this.canvas.width - blockSize,
      0,
      blockSize,
      this.canvas.height
    );
  };

  drawScore = function (blockSize = 10) {
    this.context.font = "20px Courier";
    this.context.fillStyle = "Black";
    this.context.textAlign = "left";
    this.context.textBaseline = "top";
    this.context.fillText("Рахунок: " + this.score, blockSize, blockSize);
  };

  gameOver = function () {
    clearInterval(this.intervalId);
    this.context.font = "60px Courier";
    this.context.fillStyle = "Black";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillText(
      "Кінець гри",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  };

  go() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawScore();
    this.snake.move(this.apple, this);
    this.snake.draw();
    this.apple.draw();
    this.drawBorder();
  }

  start() {
    this.intervalId = setInterval(this.go.bind(this), 200);
    addEventListener("keydown", (event) => {
      let newDirection = this.directions[event.keyCode];
      if (newDirection !== undefined) {
        this.snake.setDirection(newDirection);
      }
    });
  }
}

// let apple = new Apple(canvas);
// this.context = canvas.getContext("2d");
// addEventListener("keydown", function (event) {
//   let newDirection = directions[event.keyCode];
//   if (newDirection !== undefined) {
//     snake.setDirection(newDirection);
//   }
// });

// const snake = new Snake(canvas);

// let intervalId = setInterval(function () {
//   context.clearRect(0, 0, canvas.width, canvas.height);
//   // drawScore();
//   snake.move(apple);
//   snake.draw();
//   apple.draw();
//   // drawBorder();
// }, 100);

const game = new Game(canvas);
game.start();
// game.drawBorder();
// game.gameOver();
// game.drawScore();