import * as Util from './utility.js';



export class PlayerController{
    constructor(id,startPos,rads,tiles)
    {
       
        this.id = id;
        this.color = Util.playerColors(id);
        this.dice = []
        this.spentDie = null;
        
        this.planes = []
        this.planesTakingOff = []
        
        this.radiusValues = rads;
        this.tileAmounts = tiles;

        this.startAngle = startPos.angle;
        this.planesCreated = 0;

        this.needsToBeReDrawn = false;
    }

    

    update(gameHandler){
        this.needsToBeReDrawn = false;
        if(gameHandler.keyStates['q'] == 1)
        {
            gameHandler.keyStates['q'] = -1;
            this.planesTakingOff.push(this.createPlane(this.id))
        }

       

        if(gameHandler.timerReset){
            
            if(this.dice.length >= 3){
                this.dice.shift();
            }
         

            this.dice.push( Math.ceil(Math.random()*6))
            this.needsToBeReDrawn = true;

            if(this.planesTakingOff.length > 0)
            {
                this.planes.push(this.planesTakingOff.shift());
            }
        }

        if(this.spentDie != null)
        {
            if(this.dice[this.spentDie.index] == 6 || this.dice[this.spentDie.index] == 1)
            {
                this.planesTakingOff.push(this.createPlane(this.id))
            }
            this.dice.splice(this.spentDie.index,1)
            this.spentDie = null;
            this.needsToBeReDrawn = true;
        }

        for(let p of this.planes)
        {
            
            p.angle += (Math.PI*2)/(2*gameHandler.seccondsPerCycle)*gameHandler.delta*(gameHandler.tileAmounts[0]/p.tilesInCycle)
            p.angle = p.angle%(Math.PI*2)
            p.tileIndex = 1+Math.ceil((p.angle/(Math.PI*2))*p.tilesInCycle) 
            gameHandler.tilesOccupied[ Object.keys(gameHandler.tilesOccupied)[p.layer] ][p.tileIndex] = ({playerId: this.id});
            
            gameHandler.planes.push(p);
        }
        
        return gameHandler;
    }

    createPlane(id)
    {
        let plane = new Plane(this.planesCreated,this.id); 
        this.planesCreated++;
        plane.layer = 2;
        plane.tilesInCycle = this.tileAmounts[2];
        plane.radius = this.radiusValues[2];
        plane.angle = this.startAngle;
        return plane;
    }

    spendDie(dieElement)
    {
        if(this.spentDie == null)
        this.spentDie = {index:dieElement.getAttribute('index')}        
    }

}

class Plane{
    constructor(id,ownerId)
    {
        this.ownerId = ownerId;
        this.id = id; 
        this.color = Util.playerColors(ownerId);
        this.x = 0;
        this.y = 0;
        this.radius;
        this.angle;
        this.tilesInCycle;
        this.layer;
        this.tileIndex;
        this.interPolations = [];
        return this;
    }
}

