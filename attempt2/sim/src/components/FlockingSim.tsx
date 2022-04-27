function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function randPos() {
    return getRandomInt(100);
}

class Bird {
    xPos: number;
    yPos: number;
    zPos: number;

    // maybe need a previous direction????
    // dir: Vector3d([...])

    updatePos(x: number, y: number, z: number) {
        this.xPos = x;
        this.yPos = y;
        this.zPos = z;
    }

    constructor(x: number, y: number, z: number) {
        this.updatePos(x, y, z);
    }
}

class FlockingSim {
    numBirds: number;
    birds: Bird[] = [];

    constructor(numBirds: number) {
        this.numBirds = numBirds;

        for (let i = 0; i < numBirds; i++) {
            this.birds.push(new Bird(randPos(), randPos(), randPos()))
        }
    }

    // these params range from 0-100
    // result: update positions of birds
    // returns: array of positions
    // eg. [[x1, y1, z1], [x2, y2, z2]... ]
    getNextStep(separation: number, alignment: number, cohesion: number) {
        let ret = [];

        for (let i = 0; i < this.numBirds; i++) {
            ret.push([randPos(), randPos(), randPos()])
        }

        return ret;
    }
}

export default FlockingSim