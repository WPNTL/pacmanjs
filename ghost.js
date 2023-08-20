class Ghost {
    constructor(
        x,
        y,
        width,
        height,
        speed,
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        range
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_RIGHT;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.range = range;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargetsForGhosts[this.randomTargetIndex];
        this.changeRandomDirectionInterval = setInterval(() => this.changeRandomDirection(), 10000);
    }

    isInRange() {
        const xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        const yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        return Math.sqrt(xDistance * xDistance + yDistance * yDistance) <= this.range;
    }

    changeRandomDirection() {
        this.randomTargetIndex = (this.randomTargetIndex + 1) % 4;
    }

    moveProcess() {
        if (this.isInRange()) {
            this.target = pacman;
        } else {
            this.target = randomTargetsForGhosts[this.randomTargetIndex];
        }
        this.changeDirectionIfPossible();
        this.moveForwards();
        if (this.checkCollisions()) {
            this.moveBackwards();
            return;
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

    changeDirectionIfPossible() {
        const tempDirection = this.direction;
        this.direction = this.calculateNewDirection(
            map,
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize)
        );

        if (typeof this.direction === "undefined") {
            this.direction = tempDirection;
            return;
        }

        if (
            this.getMapY() !== this.getMapYRightSide() &&
            (this.direction === DIRECTION_LEFT || this.direction === DIRECTION_RIGHT)
        ) {
            this.direction = DIRECTION_UP;
        }

        if (
            this.getMapX() !== this.getMapXRightSide() &&
            this.direction === DIRECTION_UP
        ) {
            this.direction = DIRECTION_LEFT;
        }

        this.moveForwards();

        if (this.checkCollisions()) {
            this.moveBackwards();
            this.direction = tempDirection;
        } else {
            this.moveBackwards();
        }

        console.log(this.direction);
    }

    calculateNewDirection(map, destX, destY) {
        const mp = map.map(row => [...row]);

        const queue = [
            {
                x: this.getMapX(),
                y: this.getMapY(),
                rightX: this.getMapXRightSide(),
                rightY: this.getMapYRightSide(),
                moves: [],
            },
        ];

        while (queue.length > 0) {
            const popped = queue.shift();
            if (popped.x === destX && popped.y === destY) {
                return popped.moves[0];
            } else {
                mp[popped.y][popped.x] = 1;
                const neighborList = this.addNeighbors(popped, mp);
                for (const neighbor of neighborList) {
                    queue.push(neighbor);
                }
            }
        }

        return 1; // Default direction
    }

    addNeighbors(popped, mp) {
        const queue = [];
        const numOfRows = mp.length;
        const numOfColumns = mp[0].length;

        const directions = [
            { dx: -1, dy: 0, move: DIRECTION_LEFT },
            { dx: 1, dy: 0, move: DIRECTION_RIGHT },
            { dx: 0, dy: -1, move: DIRECTION_UP },
            { dx: 0, dy: 1, move: DIRECTION_BOTTOM },
        ];

        for (const dir of directions) {
            const newX = popped.x + dir.dx;
            const newY = popped.y + dir.dy;

            if (
                newX >= 0 && newX < numOfRows &&
                newY >= 0 && newY < numOfColumns &&
                mp[newY][newX] !== 1
            ) {
                const tempMoves = [...popped.moves];
                tempMoves.push(dir.move);
                queue.push({ x: newX, y: newY, moves: tempMoves });
            }
        }

        return queue;
    }

    getMapX(offset = 0) {
        return parseInt((this.x + offset * this.width) / oneBlockSize);
    }

    getMapY(offset = 0) {
        return parseInt((this.y + offset * this.height) / oneBlockSize);
    }

    getMapXRightSide() {
        return parseInt((this.x * 0.99 + this.width) / oneBlockSize);
    }

    getMapYRightSide() {
        return parseInt((this.y * 0.99 + this.height) / oneBlockSize);
    }

    draw() {
        canvasContext.save();
        canvasContext.drawImage(
            ghostFrames,
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
        canvasContext.beginPath();
        canvasContext.strokeStyle = "red";
        canvasContext.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.range * oneBlockSize,
            0,
            2 * Math.PI
        );
        canvasContext.stroke();
    }
}

const updateGhosts = () => {
    for (const ghost of ghosts) {
        ghost.moveProcess();
    }
};

const drawGhosts = () => {
    for (const ghost of ghosts) {
        ghost.draw();
    }
};
