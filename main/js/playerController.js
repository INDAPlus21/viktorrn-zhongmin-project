import * as Util from './utility.js';



export class PlayerController{
    constructor(id,startPos){
        this.playerID = id;
        this.color = Util.playerColors(id);
        this.dice = []
        this.planes = []
        this.startX = startPos.x;
        this.startY = startPos.y;

        return this;
    }

    getPlanes(){

    }

    updatePlanes(gameHandler){

        return gameHandler;
    }

    createPlane(){

    }

}

class Plane{
    constructor(id,ownerId){
        this.ownerId = ownerId;
        this.id = id; // "ownerid:id"
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

/*
    player:0,
    x:0,
    y:0,
    radius:radiuses[1],
    tilesInCycle: tileAmounts[1],
    layer: 1,
            angle: 0,
            dir:1,
            color: "rgba(0, 0, 180"
*/
