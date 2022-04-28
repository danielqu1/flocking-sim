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

    dis(b1: Bird, b2: Bird) {
        return Math.sqrt(
        (b1.pos.x - b2.pos.x) ** 2 +
        (b1.pos.y - b2.pos.y) ** 2 + 
        (b1.pos.z - b2.pos.z) ** 2);
      }
    // can add neighbors
    centering(bird: Bird, cohesion: number){
        // let neighbors = 0;
        let centerX = 0;
        let centerY = 0;
        let centerZ = 0;

        for (let b of this.birds){
            // if (this.dis(bird, b) < visualRange)
            centerX += b.pos.x;
            centerY += b.pos.y;
            centerZ += b.pos.z;
        }
        centerX /= this.birds.length;
        centerY /= this.birds.length;
        centerZ /= this.birds.length;
        bird.dir.x += (centerX - bird.pos.x) * 3;
        bird.dir.y += (centerY - bird.pos.y) * 3;
        bird.dir.z += (centerZ - bird.pos.z) * 3;
    }

    seperation(bird: Bird, separation: number){
        let moveX = 0;
        let moveY = 0;
        let moveZ = 0;
        for (let b of this.birds){
            if(b !== bird){
                if (this.dis(b, bird) < 40){  //arbitrary value
                    moveX += bird.pos.x - b.pos.x;
                    moveY += bird.pos.y - b.pos.y;
                    moveZ += bird.pos.z - b.pos.z;
                }
            }
        }
        bird.dir.x += moveX * 10;
        bird.dir.y += moveY * 10;
        bird.dir.z += moveZ * 10;
    }

    align(bird: Bird, alignment: number){
        let spdX = 0;
        let spdY = 0;
        let spdZ = 0;

        for(let b of this.birds){
            spdX += b.dir.x;
            spdY += b.dir.y;
            spdZ += b.dir.z;
        }
        spdX /= this.birds.length;
        spdY /= this.birds.length;
        spdZ /= this.birds.length;
        bird.dir.x += (spdX - bird.dir.x) * 1.;
        bird.dir.y += (spdY - bird.dir.y) * 1.;
        bird.dir.z += (spdZ - bird.dir.z) * 1.;
        
    }

    speed(bird: Bird){
        let limit = 30;
        let spd = Math.sqrt(bird.dir.x ** 2 + bird.dir.y ** 2 + bird.dir.z ** 2);
        if (spd > limit){
            bird.dir.x = bird.dir.x / spd * limit;
            bird.dir.y = bird.dir.y / spd * limit;
            bird.dir.z = bird.dir.z / spd * limit;
        }
    }

    inBounds(bird: Bird){
        let margin = 100;
        if (bird.pos.x < margin){
            bird.dir.x += 4;
        }
        if (bird.pos.y < margin){
            bird.dir.y += 4;
        }
        if (bird.pos.z < margin){
            bird.dir.z += 4;
        }
        if (bird.pos.x > this.width - margin){
            bird.dir.x -= 4;
        }
        if (bird.pos.y > this.height - margin){
            bird.dir.y -= 4;
        }
        if (bird.pos.z > this.depth - margin){
            bird.dir.z -= 4;
        }

    }
    // these params range from 0-100
    // result: update positions and directions of birds
    // returns: array of positions and directions
    // eg. [[pos1: vec3, dir1: vec3], [pos2: vec3, dir2: vec3]... ]
    getNextStep(separation: number, alignment: number, cohesion: number) {
        let ret = [];

        for (let b of this.birds) {
            console.log("Position: ", b.pos);
            console.log("Direction: " ,b.dir);
            //let pos = new vec3(randPos(this.width), randPos(this.height), randPos(this.depth));
            //let dir = new vec3(randPos(100), randPos(100), randPos(100));
            //dir = dir.normalize();

            this.centering(b, cohesion);
            this.seperation(b, separation);
            this.align(b, alignment);
            this.speed(b)
            this.inBounds(b)
            b.pos.x += b.dir.x;
            b.pos.y += b.dir.y;
            b.pos.z += b.dir.z;

            ret.push([b.pos, b.dir]);
        }

        return ret;
    }
}

export default FlockingSim