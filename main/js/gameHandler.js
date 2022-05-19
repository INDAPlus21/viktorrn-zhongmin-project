
import { PlayerController } from './playerController.js';

export function createGameHandler(){
    let gameHandler = new GameHandler();
    return gameHandler;
}

class GameHandler{
    constructor(){

        
        this.cycleSpeed = 1.5;  // round timer's max value before reset (a die is given when full)
        this.secondsPerCycle=4; // time for one cycle in the center ring aka time to pass 9 tiles
        
        this.lapsToWin = 2;

        this.timerValue=0,       // round timer (not displayed)
        this.timerReset=false,   // sets to true when round increments and timer resets
        this.time = 0;

        this.layerAngleSpeeds=[];   // 
        this.radiuses=[90,240,400], // radius of each ring
        this.tileAmounts=[9,18,36], // how many tiles in each ring
        this.playerAmount=4,        // how many players in the game
    
        this.pause=false,
        this.dispFPS=true,
        
    
        this.keyStates={},
        
        this.currentDateTime= new Date(),
        this.timeSinceLastUpdate= 0,
        this.frameBuffer= [],
        this.delta=1,
    
        this.clientPlayer=0,
        this.players=[],
        this.playerStartAngles=[],
        this.playerStartTiles=[]
        this.planes= [],
        
        this.tilesOccupied={
            'innerTiles': [],
            'middleTiles':[],
            'outerTiles': [],
        };

        this.boardData={
            innerTiles: [],
            middleTiles:[],
            outerTiles: []
        };

    }

    calcLayerAngleSpeeds(tileAmounts){
        let list = [];
        for(let l in [0,1,2]){
            let layerModifier = tileAmounts[0]/tileAmounts[l];
            list.push(layerModifier)
        }
        return list;
    }

    createPlayer(playerIndex,gameHandler){
        return new PlayerController(playerIndex,{angle:gameHandler.playerStartAngles[playerIndex]},gameHandler.radiuses,gameHandler.tileAmounts,gameHandler.playerStartTiles[playerIndex]);
    }

    createBoard(layers,boardData){ 
        for(let layer of layers){
            let tileAmount = layer.tiles;
            let radius = layer.radius;
            let ring = {
                type:'ringOutline',
                x: 0,
                y: 0,
                radius: radius,
            }
            boardData[layer.circleLayer+'Tiles'].push(ring);
            
            for(let step = 0; step < tileAmount; step++){  
            
                let ang1 = 2*Math.PI * step/tileAmount;
                let x =  radius*Math.cos(ang1);
                let y =  radius*Math.sin(ang1);
               
                let tile = {
                    type:'tile',
                    x:x,
                    y:y,
                    index:step+1,
                    angle:ang1,
                    tileType:'tile',
                    inCost:[],
                    outCost:[],
                    plane:null,
                }
                boardData[layer.circleLayer+'Tiles'].push(tile);
            }
        }
        //outer tile
        let j = 0;
        for(let i in boardData['outerTiles']){
            if(i == 0) continue; 
            let tile = boardData['outerTiles'][i];
            if( (i - 1 - 2 )%(this.tileAmounts[2]/4) == 0 ){
                tile.tileType = 'Passage';
                tile.inCost = [1,3,5];
                j+=1;
            }
        }

        //middle tiles
        j = 0;
        for(let i in boardData['middleTiles']){
            if(i == 0) continue; 
            let tile = boardData['middleTiles'][i];
            if( ( i-1 )%(this.tileAmounts[1]/3) == 0 ){
                tile.tileType = 'Passage';
                tile.inCost = [2,4];
                tile.outCost = [2,5];
                j+=1;
            }
        }

        //inner tiles
        j = 0;
        for(let i in boardData['innerTiles']){
            if(i == 0) continue; 
            let tile = boardData['innerTiles'][i];
            if( ( i )%(this.tileAmounts[0]/3) == 0 ){
                tile.tileType = 'Passage';
               
                tile.outCost = [1,6];
                j+=1;
            }
        }
    
        //start positions
    
        j = 0;
        
       for(let i in boardData['outerTiles'])
       {
            if(i == 0) continue; 
            let tile = boardData['outerTiles'][i];
            if( (i - 1 + 4 )%(this.tileAmounts[2]/this.playerAmount) == 0 )
            {
                tile.tileType = j+'Start';
                this.playerStartAngles[j] = tile.angle;
                this.playerStartTiles[j] = tile.index;
                console.log(tile.angle)
                j+=1;
            }
        }
     
        return boardData;
    }

    // from server to all clients
    // sendTime = current unix timestamp
    // 
    updateGameHandler(sendTime,serverPlayerList){
        this.delta = this.time - sendTime;

        for(let i in serverPlayerList.players){
            this.players[i] = serverPlayerList[i];
        }
    }
}