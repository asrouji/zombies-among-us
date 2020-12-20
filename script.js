/* globals createCanvas, background, circle, fill, noStroke, width, height, random, keyIsDown, collideCircleCircle, isMousePressed, loadImage, image, noLoop, CENTER
textAlign, textSize, fill, text, mouseIsPressed, mouseX, mouseY, keyPressed, UP_ARROW, RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, SPACEBAR*/

let round = 1;
let zombies = [];
let pellets = [];
let reload = 50;
let player;
let grass;

const scarecrow = {
  time: 360,
  x: null,
  y: null
};

let playerSprite;
let deadSprite;
let zombieSprite;
let pelletSprite;
let baitSprite;
let scarecrowSprite;

const healthSpan = document.querySelector("#health");
const roundSpan = document.querySelector("#round");
const zombieSpan = document.querySelector("#zombies");
const scarecrowSpan = document.querySelector("#scarecrow");

function preload() {
  grass = loadImage(
    "https://cdn.glitch.com/20cb59db-fe33-4c97-aadc-554ac0d775e5%2Fgrassbackground2.jpg?v=1608419246326"
  );

  playerSprite = loadImage(
    "https://cdn.glitch.com/20cb59db-fe33-4c97-aadc-554ac0d775e5%2FHW6_Player.gif?v=1608420155895"
  );
  zombieSprite = loadImage(
    "https://cdn.glitch.com/20cb59db-fe33-4c97-aadc-554ac0d775e5%2FHW6_Zombie%20(2).gif?v=1608420866167"
  );
  pelletSprite = loadImage(
    "https://cdn.glitch.com/20cb59db-fe33-4c97-aadc-554ac0d775e5%2FHW6_Pellet.gif?v=1608425491248"
  );
  scarecrowSprite = loadImage(
    "https://cdn.glitch.com/20cb59db-fe33-4c97-aadc-554ac0d775e5%2FHW6_Scarecrow.gif?v=1608424632996"
  );

  deadSprite = loadImage(
    "https://cdn.glitch.com/20cb59db-fe33-4c97-aadc-554ac0d775e5%2FHW6_PlayerDed.png?v=1608422094668"
  );
}

function setup() {
  createCanvas(800, 600);
  player = new Player(width / 2, height / 2);
  roundSpan.textContent = round;
  scarecrowSpan.textContent = "Available";
  spawnZombies();
}

function draw() {
  background(grass);
  player.draw();
  player.checkZombieCollision();
  player.move();
  player.fire();
  for (let pellet of pellets) {
    pellet.draw();
    pellet.move();
    pellet.checkZombieCollision();
  }
  player.scarecrow();
  for (let zombie of zombies) {
    zombie.draw();
    zombie.move();
  }
  zombieSpan.textContent = zombies.length;
  if (zombies.length === 0) {
    nextRound();
  }
}

function spawnZombies() {
  let zombieCount = round * 0.15 * 24;
  let spawnRange = round / 5 + 1;
  let minSpeed = 0.5 + round / 50;
  let maxSpeed = 1 + round / 50;
  while (zombies.length < zombieCount) {
    let zombieX =
      Math.random() < 0.5
        ? random(-width * spawnRange, 0)
        : random(width, width * spawnRange);
    let zombieY =
      Math.random() < 0.5
        ? random(-height * spawnRange, 0)
        : random(height, height * spawnRange);
    let zombieSpeed =
      maxSpeed < 2 ? random(minSpeed, maxSpeed) : random(1.5, 2);
    zombies.push(new Zombie(zombieX, zombieY, zombieSpeed));
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 3;
    this.health = 100;
  }
  draw() {
    image(playerSprite, this.x - 21.5, this.y - 22);
    reload--;
  }
  move() {
    if (this.health <= 0) return;
    if (keyIsDown(87) && this.y >= 0) {
      this.y -= this.speed;
    }
    if (keyIsDown(65) && this.x >= 0) {
      this.x -= this.speed;
    }
    if (keyIsDown(83) && this.y <= height) {
      this.y += this.speed;
    }
    if (keyIsDown(68) && this.x <= width) {
      this.x += this.speed;
    }
  }
  checkZombieCollision() {
    if (this.health <= 0) {
      noLoop();
      gameOver();
    }
    for (let zombie of zombies) {
      if (collideCircleCircle(player.x, player.y, 30, zombie.x, zombie.y, 25)) {
        this.health -= 1;
      }
    }
    healthSpan.textContent = this.health;
  }
  fire() {
    if (keyIsDown(UP_ARROW) && reload <= 0) {
      pellets.push(new Pellet(this.x, this.y, "up"));
      reload = 50;
    } else if (keyIsDown(DOWN_ARROW) && reload <= 0) {
      pellets.push(new Pellet(this.x, this.y, "down"));
      reload = 50;
    } else if (keyIsDown(LEFT_ARROW) && reload <= 0) {
      pellets.push(new Pellet(this.x, this.y, "left"));
      reload = 50;
    } else if (keyIsDown(RIGHT_ARROW) && reload <= 0) {
      pellets.push(new Pellet(this.x, this.y, "right"));
      reload = 50;
    }
  }
  scarecrow() {
    if (keyIsDown(32) && scarecrow.time === 360) {
      scarecrow.x = this.x;
      scarecrow.y = this.y;
      scarecrow.time -= 1;
    }
    if (scarecrow.time < 360 && scarecrow.time > 0) {
      scarecrowSpan.textContent = "Unavailable";
      image(scarecrowSprite, scarecrow.x - 14, scarecrow.y - 30);
      scarecrow.time -= 1;
    }
  }
}

class Zombie {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
  }
  draw() {
    image(zombieSprite, this.x - 19, this.y - 21);
  }
  move() {
    let colliding = false;
    let collidedZombie;
    for (let zombie of zombies) {
      if (
        this !== zombie &&
        collideCircleCircle(this.x, this.y, 25, zombie.x, zombie.y, 25)
      ) {
        colliding = true;
        collidedZombie = zombie;
        continue;
      }
    }
    if (colliding && this.speed < collidedZombie.speed) {
      this.x > collidedZombie.x
        ? (this.x += this.speed)
        : (this.x -= this.speed);
      this.y > collidedZombie.y
        ? (this.y += this.speed)
        : (this.y -= this.speed);
    } else if (scarecrow.time < 360 && scarecrow.time > 0) {
      scarecrow.x > this.x ? (this.x += this.speed) : (this.x -= this.speed);
      scarecrow.y > this.y ? (this.y += this.speed) : (this.y -= this.speed);
    } else {
      player.x > this.x ? (this.x += this.speed) : (this.x -= this.speed);
      player.y > this.y ? (this.y += this.speed) : (this.y -= this.speed);
    }
  }
}

class Pellet {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = 5;
  }
  draw() {
    image(pelletSprite, this.x - 12, this.y - 12);
  }
  move() {
    if (this.x > width || this.x < 0 || this.y > height || this.y < 0)
      pellets.splice(pellets.indexOf(this), 1);
    if (this.direction === "up") this.y -= this.speed;
    if (this.direction === "down") this.y += this.speed;
    if (this.direction === "left") this.x -= this.speed;
    if (this.direction === "right") this.x += this.speed;
  }
  checkZombieCollision() {
    for (let [index, zombie] of zombies.entries()) {
      if (collideCircleCircle(this.x, this.y, 7, zombie.x, zombie.y, 25)) {
        zombies.splice(index, 1);
        pellets.splice(pellets.indexOf(this), 1);
        if(player.health < 100) player.health++;
      }
    }
  }
}

function nextRound() {
  round++;
  roundSpan.textContent = round;
  scarecrow.time = 360;
  scarecrowSpan.textContent = "Available";
  spawnZombies();
}

function gameOver() {
  background(150);
  textAlign(CENTER);
  textSize(86);
  fill("blue");
  text("GAME OVER", width / 2, height / 2);
  image(deadSprite, player.x, player.y);
}
