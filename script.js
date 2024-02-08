const canvas = document.getElementById("canvas");
const colors = ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"];
const words = ["orange", "house", "capibility"];
const word = words[Math.floor(Math.random() * words.length)];

class Block {
    constructor(canvas, col = 0, row = 0, blockSize = 10, colors = ["Blue"]) {
        this.context = canvas.getContext("2d");
        this.col = col;
        this.row = row;
        this.colors = colors;
        this.blockSize = blockSize;
        this.letter = word[0];
    }
    drawSquare = function (color = "blue", letterNum) {
        let x = this.col * this.blockSize;
        let y = this.row * this.blockSize;
        this.context.fillStyle = color;
        this.context.fillRect(x, y, this.blockSize, this.blockSize);
        if (letterNum > 0) {
            this.context.font = "12px Courier";
            this.context.fillStyle = "White";
            this.context.fillText(word[letterNum - 1], this.col * this.blockSize + this.blockSize / 9, this.row * this.blockSize + this.blockSize / 12);
        }
    };

    drawCircle = function (color = "LimeGreen", letter) {
        let centerX = this.col * this.blockSize + this.blockSize / 2;
        let centerY = this.row * this.blockSize + this.blockSize / 2;
        this.context.fillStyle = color;
        this.circle(centerX, centerY, this.blockSize / 2, true);
        this.context.font = "10px Courier";
        this.context.fillStyle = "Black";
        this.context.fillText(letter, this.col * this.blockSize + this.blockSize / 4, this.row * this.blockSize + this.blockSize / 12);
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
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.canvas = canvas;
        this.letter = word[0];
    }

    draw = function () {
        this.block.drawCircle(this.color, this.letter);
    };

    move = function () {
        let hitAudio = new Audio('./sounds/hit.mp3');
        hitAudio.play();
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
            // new Block(canvas, 6, 5),
            // new Block(canvas, 5, 5),
        ];
        this.direction = "right";
        this.nextDirection = "right";
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.canvas = canvas;
    }

    draw = function () {
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].drawSquare(this.color, i);
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
            apple.letter = word[game.score];
            this.color = apple.color;
            apple.color = colors[Math.floor(Math.random() * colors.length)];
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

    drawInfo = function (blockSize = 10) {
        this.context.font = "20px Courier";
        this.context.fillStyle = "Black";
        this.context.textAlign = "left";
        this.context.textBaseline = "top";
        this.context.fillText("Score: " + this.score, blockSize, blockSize + 20);
        this.context.fillText("Word: " + word.slice(0, this.score), blockSize, blockSize);
        this.context.fillText("Left " + (word.length - this.score) + " letters", blockSize, blockSize + 40);
        if (this.score >= word.length) {
            this.victory();
        }
    };

    gameOver = function (blockSize = 10) {
        clearInterval(this.intervalId);
        let gameOverAudio = new Audio('./sounds/game-over.mp3');
        gameOverAudio.play();
        this.context.fillText("Word: " + word, blockSize, blockSize);
        this.context.font = "60px Courier";
        this.context.fillStyle = "Black";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.apple.letter = "";
        this.context.fillText(
            "Game over",
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    };

    victory = function () {
        clearInterval(this.intervalId);
        let victoryAudio = new Audio('./sounds/victory.mp3');
        victoryAudio.play();
        this.context.font = "60px Courier";
        this.context.fillStyle = "Green";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.apple.letter = "";
        this.context.fillText(
            "Victory!",
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    };

    go() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawInfo();
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
//   // drawInfo();
//   snake.move(apple);
//   snake.draw();
//   apple.draw();
//   // drawBorder();
// }, 100);

const game = new Game(canvas);
game.start();
// game.drawBorder();
// game.gameOver();
// game.drawInfo();