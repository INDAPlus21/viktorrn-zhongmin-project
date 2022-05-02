import * as Util from './utility.js';



export class PlayerController{
    constructor(id,startPos){
        this.id = id;
        console.log(id)
        this.color = Util.playerColors(id);
        this.dice = []
        this.planes = []
        
        this.startAng = startPos.angle;
        this.planesCreated = 0;

       
    }

    

    update(gameHandler){
       
        if(gameHandler.keyStates['q'] == 1){
            gameHandler.keyStates['q'] = -1;
            this.planes.push(this.createPlane(this.id,gameHandler))
        }

        for(let p of this.planes){
            
            p.angle += (Math.PI*2)/gameHandler.seccondsPerCycle*gameHandler.delta*(gameHandler.tileAmounts[0]/p.tilesInCycle)
            p.angle = p.angle%(Math.PI*2)
            
            gameHandler.planes.push(p);
        }
        
        return gameHandler;
    }

    createPlane(id,gameHandler){
        console.log(id)
        let plane = new Plane(this.planesCreated,this.id); 
        this.planesCreated++;
        plane.layer = 1;
        plane.tilesInCycle = gameHandler.tileAmounts[2];
        plane.radius = gameHandler.radiuses[2];
        plane.angle = 0;
        console.log("created plane",plane);
        return plane;
    }

}

class Plane{
    constructor(id,ownerId){
        this.ownerId = ownerId;
        this.id = id; 
        console.log(ownerId)
        this.color = Util.playerColors(ownerId);
        this.x = 0;
        this.y = 0;
        this.radius;
        this.tilesInCycle;
        this.layer;
        this.tileIndex;
        this.interPolations = [];
        return this;
    }
}

