import { getGameHandler } from './main.js';
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
        
        this.dieSelected = null; 
        this.overPlane = null;

        
        
    }

    

    update(gameHandler){
        
        this.needsToBeReDrawn = false;
        if(gameHandler.keyStates['q'] == 1)
        {
            gameHandler.keyStates['q'] = -1;
            this.planesTakingOff.push(this.createPlane(gameHandler.time))
        }

        this.needsToBeReDrawn = true;

        if(gameHandler.timerReset)
        {
            
            if(this.dice.length >= 3){
                this.dice.shift();
                
                if(this.dieSelected != null)
                {
                    this.dieSelected.index -=1;
                    if(this.dieSelected.index <= -1)
                    {
                        this.dieSelected = null;
                    }
                }

            }

            this.dice.push( Math.ceil(Math.random()*6))
            this.needsToBeReDrawn = true;

            
            if(this.spentDie != null)
            {
                if(this.spentDie == 6 || this.spentDie  == 1)
                {
                    this.planesTakingOff.push(this.createPlane(this.id))
                }
                //this.dice.splice(this.spentDie.index,1)
                this.spentDie = null;
                this.needsToBeReDrawn = true;
            }

            if(this.planesTakingOff.length > 0)
            {
                let plane = this.planesTakingOff.shift();
                plane.startAngle = this.startAngle;
                plane.creationTime = gameHandler.time;
                this.planes.push(plane);
            }
 
            
        }


        for(let p of this.planes)
        {
            p.update(gameHandler);
            p.tileIndex = 1+Math.ceil((p.angle/(Math.PI*2))*gameHandler.tileAmounts[p.layer]) 
            gameHandler.tilesOccupied[ Object.keys(gameHandler.tilesOccupied)[p.layer] ][p.tileIndex] = ({playerId: this.id});   
            gameHandler.planes.push(p);
        }
        
        return gameHandler;
    }

   

    createPlane(creationTime)
    {
        let plane = new Plane(this.planesCreated,this.id); 
        this.planesCreated++;
        plane.layer = 2;
        plane.tilesInCycle = this.tileAmounts[2];
        plane.radius = this.radiusValues[2];
        plane.angle = this.startAngle;
        plane.creationTime = creationTime;
    
        return plane;
    }

    klickedDie(dieElement){
        this.dieSelected = {index:Number(dieElement.getAttribute('index'))}
    }

    klickedAddDieToPlane(index){
        if(this.planes[index].die != null) return
        if(this.dieSelected == null) 
        {
            return
        }
        this.planes[index].die = this.spendSelectedDie();
        console.log( this.planes[index]) 
    }

    klickedStartPlane(){
        if(this.spentDie == null)
        this.spentDie = this.spendSelectedDie();
    }


    spendSelectedDie()
    {
        let removedDie = this.dice.splice(this.dieSelected.index,1)
        this.dieSelected = null;
        return removedDie[0];
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
        this.startAngle;
        this.drawAngle;
        this.tilesInCycle;
        
        this.layer;
        this.prevLayer;
        this.tileIndex;
        this.interp = 1;
        this.shadow = null

        this.die = null;
        this.creationTime = null;
        return this;
    }

    transition(newLayer) {
        this.interp = 0.0;
        this.prevLayer = this.layer;

        this.shadow = Object.assign( {}, this );
        Object.setPrototypeOf( this.shadow, Plane.prototype );

        this.layer = newLayer;
    }

    update(gameHandler){
        let prevC = this.calcC(gameHandler);
        this.updateAngle(gameHandler);
        
        if(this.shadow != null)
            this.shadow.updateAngle(gameHandler);
    
        this.interp += gameHandler.delta;
        this.interp = Math.min(this.interp, 1.0);
        
        let C = this.calcC( gameHandler);
        this.x = C.x;
        this.y = C.y;
    
    
        {
            let dxdt = (C.x - prevC.x);
            let dydt = (C.y - prevC.y);

            this.drawAngle = Math.atan2(-dxdt, dydt);
        }
    }

    calcX(angle, radius){
        return radius*Math.cos(angle)
    }
    
    calcY(angle, radius){
        return radius*Math.sin(angle)
    }
    
    calcC(gameHandler) {
        let cLayerAngle = this.angle
        let pLayerAngle = this.shadow?.angle ?? cLayerAngle;
       
        
        let currentLayerX = this.calcX(cLayerAngle, gameHandler.radiuses[this.layer]);
        let currentLayerY = this.calcY(cLayerAngle, gameHandler.radiuses[this.layer]);
    
        let prevLayerX = this.calcX(pLayerAngle, gameHandler.radiuses[this.shadow?.layer ?? this.layer]);
        let prevLayerY = this.calcY(pLayerAngle, gameHandler.radiuses[this.shadow?.layer ?? this.layer]);
        
        let interp_curve = 0.5 + Math.atan(7 * (this.interp - 0.5) )/(2 * Math.atan(7 * 0.5))

        let x = Util.linInterp(prevLayerX, currentLayerX, interp_curve);
        let y = Util.linInterp(prevLayerY, currentLayerY, interp_curve);
    
        return {x:x, y:y};
    }
    
    updateAngle(gameHandler){
        let base_vel = (Math.PI*2)/(2*gameHandler.seccondsPerCycle);
        let layer_multiplier = gameHandler.tileAmounts[0]/gameHandler.tileAmounts[this.layer];
    
        this.angle += gameHandler.delta * base_vel * layer_multiplier;
        this.angle %= Math.PI * 2;
    }
}

