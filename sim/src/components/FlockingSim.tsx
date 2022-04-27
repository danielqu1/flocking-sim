class vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    subtract(other: vec3) {
        let diffX = this.x - other.x;
        let diffY = this.y - other.y;
        let diffZ = this.z - other.z;
        return new vec3(diffX, diffY, diffZ);
    }

    norm() {
        return Math.sqrt(
            Math.pow(this.x, 2) + 
            Math.pow(this.y, 2) + 
            Math.pow(this.z, 2)
        );
    }

    normalize() {
        let thisNorm = this.norm();
        return new vec3(
            this.x / thisNorm,
            this.y / thisNorm,
            this.z / thisNorm
        );
    }
}


function randPos(max) {
    return Math.floor(Math.random() * max);
}

const timestep = .15;

class Bird {
    pos: vec3;
    dir: vec3;

    updatePos(pos: vec3) {
        this.pos = pos;
    }

    updateDir(dir: vec3) {
        this.dir = dir;
    }

    constructor(pos: vec3, dir: vec3) {
        this.updatePos(pos);
        this.updateDir(dir);
    }
}

class FlockingSim {
    numBirds: number;
    birds: Bird[] = [];
    width: number;
    height: number;
    depth: number;

    constructor(numBirds: number, width: number, height: number, depth: number) {
        this.numBirds = numBirds;
        this.width = width;
        this.height = height;
        this.depth = depth;

        for (let i = 0; i < numBirds; i++) {
            let pos = new vec3(randPos(width), randPos(height), randPos(depth));
            let dir = new vec3(randPos(100), randPos(100), randPos(100));
            dir = dir.normalize();

            this.birds.push(new Bird(pos, dir))
        }
    }

    // these params range from 0-100
    // result: update positions and directions of birds
    // returns: array of positions and directions
    // eg. [[pos1: vec3, dir1: vec3], [pos2: vec3, dir2: vec3]... ]
    getNextStep(separation: number, alignment: number, cohesion: number) {
        let ret = [];

        for (let i = 0; i < this.numBirds; i++) {
            let pos = new vec3(randPos(this.width), randPos(this.height), randPos(this.depth));
            let dir = new vec3(randPos(100), randPos(100), randPos(100));
            dir = dir.normalize();

            ret.push([pos, dir]);
        }

        return ret;
    }
}

export default FlockingSim