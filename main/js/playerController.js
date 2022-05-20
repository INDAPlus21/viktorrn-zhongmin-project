import * as Util from './utility.js';

export class PlayerController{
   

    constructor(id,startPos,rads,tiles,startTile,playerName)
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
        this.startTile = startTile;
        this.activePlanes = 0;
        this.maxActivePlanes = 4;
        this.planesCompleted = 0;

        this.needsToBeReDrawn = false;
        
        this.dieSelected = null; 
        this.overPlane = null;

        this.name = playerName;   
        
    }

    setName(name){
        this.name = name;
    }

    update(gameHandler){
        
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
            
            if(this.spentDie != null)
            {
                if(this.spentDie == 6 || this.spentDie  == 1)
                {
                    if(this.activePlanes < this.maxActivePlanes)
                    {
                        this.planesTakingOff.push(this.createPlane(this.id))
                    }
                    
                }
                
                this.spentDie = null;
            }

            if(this.planesTakingOff.length > 0)
            {
                let plane = this.planesTakingOff.shift();
                plane.creationTime = gameHandler.time;
                plane.startAngle = this.startAngle;
                
                this.planes.push(plane);
            }
 
            
        }

        for(let i in this.planes)
        {
            let p = this.planes[i];
            p.update(gameHandler);
            let tile = p.calculateTile(gameHandler,p.layer);
            
            if(p.tileIndex != tile)
            {
                p.tileIndex = tile;

                switch(p.layer)
                {
                    case 0:
                        if(p.tileIndex == p.enterdLayerOnTile)
                        {
                            p.LapsInMiddle++;
                            console.log(p.LapsInMiddle)
                            if(p.LapsInMiddle >= gameHandler.lapsToWin)
                            {
                                p.completedMiddleRun = true;
                                console.log(p.completedMiddleRun)
                            }
                        }
                    break;

                    case 2:
                        if(p.completedMiddleRun)
                        {
                            if(tile == this.startTile){
                                console.log("completed run")
                                this.planes.splice(i,1);
                                this.activePlanes--;
                                this.planesCompleted++;
                            }
                        }
                        break;
                }

                if(p.die  != null)
                {
                    let l = Object.keys(gameHandler.tilesOccupied)[p.layer];
                    if(gameHandler.boardData[l][p.tileIndex].tileType == "Passage")
                    {
                        console.log("passed passage with die",p.die)
                        if(gameHandler.boardData[l][p.tileIndex].inCost.includes(p.die))
                        {

                            p.transition(p.layer-1)
                            p.die = null;
                            p.enterdLayerOnTile = p.calculateTile(gameHandler,p.layer);
                            console.log(p.enterdLayerOnTile)
                        }
                        
                        if(gameHandler.boardData[l][p.tileIndex].outCost.includes(p.die))
                        {
                            p.LapsInMiddle = 0;
                            p.enterdLayerOnTile = p.calculateTile(gameHandler,p.layer);
                            p.transition(p.layer+1)
                            p.die = null;
                            console.log(p.enterdLayerOnTile)
                        }
                    }
                }
            }
            
            if(p == null || p == undefined) continue;
            gameHandler.tilesOccupied[ Object.keys(gameHandler.tilesOccupied)[p.layer] ][p.tileIndex+1] = ({playerId: this.id});   
            gameHandler.planes.push(p);
        }

        
        
        return gameHandler;
    }

   resetPlayer(){
       this.planes = [];
       this.activePlanes = 0;
       this.dieSelected = null;
       this.planesCompleted = 0;
       this.dice = [];
       this.planesTakingOff = [];
       this.spentDie = null;
       
   }

    createPlane(creationTime)
    {
        let plane = new Plane(this.activePlanes,this.id); 
        this.activePlanes++;
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
    }

    klickedStartPlane(){
        if(this.spentDie == null)
        this.spentDie = this.spendSelectedDie();

    }


    spendSelectedDie()
    {
        if(this.dieSelected == null) return null;
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
        this.startTile;

        this.drawAngle;
        this.tilesInCycle;

        this.LapsInMiddle = 0;
        this.enterdLayerOnTile;
        this.completedMiddleRun = false;
        
        this.layer;
        this.prevLayer;
        
        this.tileIndex;

        this.onTile;

        this.interp = 1;
        this.shadow = null

        this.die = null;
        this.spentDie = null;
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
        let pLayerAngle = cLayerAngle;
        if( this.shadow != null ){
            pLayerAngle = this.shadow.angle
        }
       
        
        let currentLayerX = this.calcX(cLayerAngle, gameHandler.radiuses[this.layer]);
        let currentLayerY = this.calcY(cLayerAngle, gameHandler.radiuses[this.layer]);
    
        let prevLayerX = this.calcX(pLayerAngle, gameHandler.radiuses[this.layer]);
        let prevLayerY = this.calcY(pLayerAngle, gameHandler.radiuses[this.layer]);
        
        if(this.shadow != null)
        {
            prevLayerX = this.calcX(pLayerAngle, gameHandler.radiuses[this.shadow.layer]);
            prevLayerY = this.calcY(pLayerAngle, gameHandler.radiuses[this.shadow.layer]);
        }
       
        
        let interp_curve = 0.5 + Math.atan(7 * (this.interp - 0.5) )/(2 * Math.atan(7 * 0.5))

        let x = Util.linInterp(prevLayerX, currentLayerX, interp_curve);
        let y = Util.linInterp(prevLayerY, currentLayerY, interp_curve);
    
        return {x:x, y:y};
    }
    
    updateAngle(gameHandler){
        let base_vel = (Math.PI*2)/( gameHandler.secondsPerCycle);
        let layer_multiplier = gameHandler.tileAmounts[0]/gameHandler.tileAmounts[this.layer];
        this.angle %= Math.PI * 2;
        this.angle += gameHandler.delta * base_vel * layer_multiplier;
        
    }

    calculateTile(gameHandler,layer){
        let layer_tiles = gameHandler.tileAmounts[layer];
        let offset = Math.PI/layer_tiles;
        let angleNorm = ( this.angle -offset )/(Math.PI*2);
        
        let tileIndex = Math.ceil( (angleNorm )* layer_tiles ) 
        tileIndex %= layer_tiles;
        return tileIndex;
    }

    klickedOnPlaneDie(e){
        this.die = null;
    }
}