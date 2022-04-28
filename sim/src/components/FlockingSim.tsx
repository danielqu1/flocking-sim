class vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other: vec3) {
        let sumX = this.x + other.x;
        let sumY = this.y + other.y;
        let sumZ = this.z + other.z;
        return new vec3(sumX, sumY, sumZ);
    }

    subtract(other: vec3) {
        let diffX = this.x - other.x;
        let diffY = this.y - other.y;
        let diffZ = this.z - other.z;
        return new vec3(diffX, diffY, diffZ);
    }

    updateAdd(other: vec3) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    }

    updateSubtract(other: vec3) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        return this;
    }

    scaleUp(c: number) {
        return new vec3(this.x * c, this.y * c, this.z * c);
    }

    scaleDown(c: number) {
        return this.scaleUp(1.0 / c);
    }

    updateScaleUp(c: number) {
        this.x *= c;
        this.y *= c;
        this.z *= c;
        return this;
    }

    updateScaleDown(c: number) {
        return this.updateScaleUp(1.0 / c);
    }

    negate() {
        return this.scaleUp(-1);
    }

    updateNegate() {
        return this.updateScaleUp(-1);
    }

    normSquared() {
        return Math.pow(this.x, 2) + 
            Math.pow(this.y, 2) + 
            Math.pow(this.z, 2);
    }

    norm() {
        return Math.sqrt(this.normSquared());
    }

    normalize() {
        let thisNorm = this.norm();

        // return this if norm is 0
        if (thisNorm == 0) {
            return this.copy();
        }

        return new vec3(
            this.x / thisNorm,
            this.y / thisNorm,
            this.z / thisNorm
        );
    }

    updateNormalize() {
        let thisNorm = this.norm();

        // do nothing if norm is 0
        if (thisNorm == 0) {
            return this;
        }

        this.x /= thisNorm;
        this.y /= thisNorm;
        this.z /= thisNorm;
        return this;
    }

    distance(other: vec3) {
        return this.subtract(other).norm();
    }

    copy() {
        return new vec3(this.x, this.y, this.z);
    }
}


function randPos(max) {
    return Math.floor(Math.random() * max);
}

const timestep = 10;

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
            let dir = new vec3(1, 0, 0);
            dir.updateNormalize();

            this.birds.push(new Bird(pos, dir))
        }
    }

    getCur() {
        let ret = [];
        for (let b of this.birds) {
            ret.push([b.pos, b.dir]);
        }
        return ret;
    }

    // these params range from 0-100
    // result: update positions and directions of birds
    // returns: array of positions and directions
    // eg. [[pos1: vec3, dir1: vec3], [pos2: vec3, dir2: vec3]... ]
    getNextStep(separation: number, alignment: number, cohesion: number, momentum: number, visualRange: number) {
        let ret = [];

        let weightedSeparation = (separation / 180) + .3;
        let weightedAlignment = alignment / 100;
        let weightedCohesion = cohesion / 100;
        let weightedMomentum = momentum / 70;

        let newBirds = [];
        for (let b of this.birds) {
            let avgPos = new vec3(0, 0, 0);
            let avgDir = new vec3(0, 0, 0);
            let sepDir = new vec3(0, 0, 0);
            let numInRange = 0;

            for (let other of this.birds) {
                // skip if other is b
                if (other === b) {
                    continue;
                }

                // check if other in visual range
                if (b.pos.distance(other.pos) > visualRange) {
                    continue;
                }

                avgPos.updateAdd(other.pos);
                avgDir.updateAdd(other.dir);
                sepDir.updateAdd(other.pos.subtract(b.pos));

                numInRange += 1;
            }

            let newDir = b.dir.copy();

            if (numInRange !== 0) {
                avgPos.updateScaleDown(numInRange);
                avgDir.updateScaleDown(numInRange);

                sepDir.updateNegate().updateNormalize();
                let alignDir = avgDir.normalize();
                let cohesionDir = avgPos.subtract(b.pos).normalize();

                sepDir.updateScaleUp(weightedSeparation);
                alignDir.updateScaleUp(weightedAlignment);
                cohesionDir.updateScaleUp(weightedCohesion);
                let momentumDir = b.dir.scaleUp(weightedMomentum);

                newDir = sepDir.add(alignDir).add(cohesionDir).add(momentumDir);
            }

            let newPos = b.pos.add(newDir.scaleUp(timestep));

            // make sure newPos is in boundaries
            if (newPos.x < 0) {
                newPos.x = 0;
                newDir.x = -newDir.x;
            }
            if (newPos.x > this.width) {
                newPos.x = this.width;
                newDir.x = -newDir.x;
            }
            if (newPos.y < 0) {
                newPos.y = 0;
                newDir.y = -newDir.y;
            }
            if (newPos.y > this.height) {
                newPos.y = this.height;
                newDir.y = -newDir.y;
            }
            if (newPos.z < 0) {
                newPos.z = 0;
                newDir.z = -newDir.z;
            }
            if (newPos.z > this.depth) {
                newPos.z = this.depth;
                newDir.z = -newDir.z;
            }

            newBirds.push(new Bird(newPos, newDir))
            ret.push([newPos, newDir]);
        }

        this.birds = newBirds;
        return ret;
    }
}

export default FlockingSim