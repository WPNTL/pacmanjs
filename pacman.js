class Pacman {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 4;
        this.nextDirection = 4;
        this.frameCount = 7;
        this.currentFrame = 1;

        this.animationInterval = setInterval(() => this.changeAnimation(), 100);
    }

    moveProcess() {
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            return;
        }
    }

    eat() {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (map[i][j] === 2 && this.getMapX() === j && this.getMapY() === i) {
                    map[i][j] = 3;
                    score++;
                }
            }
        }
    }

    moveBackwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT:
                this.x -= this.speed;
                break;
            case DIRECTION_UP:
                this.y += this.speed;
                break;
            case DIRECTION_LEFT:
                this.x += this.speed;
                break;
            case DIRECTION_BOTTOM:
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case DIRECTION_RIGHT:
                this.x += this.speed;
                break;
            case DIRECTION_UP:
                this.y -= this.speed;
                break;
            case DIRECTION_LEFT:
                this.x -= this.speed;
                break;
            case DIRECTION_BOTTOM:
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        const positions = [
            [0, 0],
            [0.9999, 0],
            [0, 0.9999],
            [0.9999, 0.9999]
        ];

        return positions.some(([dx, dy]) => {
            const xIndex = parseInt((this.x + dx * this.width) / oneBlockSize);
            const yIndex = parseInt((this.y + dy * this.height) / oneBlockSize);
            return map[yIndex][xIndex] === 1;
        });
    }

    checkGhostCollision(ghosts) {
        return ghosts.some(ghost => ghost.getMapX() === this.getMapX() && ghost.getMapY() === this.getMapY());
    }

    changeDirectionIfPossible() {
        if (this.direction === this.nextDirection) return;

        const tempDirection = this.direction;
        this.direction = this.nextDirection;
        this.moveForwards();

        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }
    }

    getMapX(offset = 0) {
        return parseInt((this.x + offset * this.width) / oneBlockSize);
    }

    getMapY(offset = 0) {
        return parseInt((this.y + offset * this.height) / oneBlockSize);
    }

    changeAnimation() {
        this.currentFrame = (this.currentFrame % this.frameCount) + 1;
    }

    draw() {
        canvasContext.save();
        canvasContext.translate(
            this.x + this.width / 2,
            this.y + this.height / 2
        );
        canvasContext.rotate((this.direction * 90 * Math.PI) / 180);
        canvasContext.translate(
            -this.x - this.width / 2,
            -this.y - this.height / 2
        );
        canvasContext.drawImage(
            pacmanFrames,
            (this.currentFrame - 1) * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
    }
}
