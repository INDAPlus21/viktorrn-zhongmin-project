import * as Util from './utility.js';
const diceKey = Util.$('diceHolder');

export function drawUI(inData){
    for(let data of inData.data){
        switch(data[0]){
            case 'drawPlayer':
                drawPlayer(data[1])
                break;
        }
    }
    return;
}

function drawPlayer(playerData){
    if(!playerData.needsToBeReDrawn) return;
    
    Util.clearDOMElement(diceKey);
    for(let ind in playerData.dice){
        let die = playerData.dice[ind];
        let dieDiv = document.createElement('div');
        dieDiv.setAttribute('value',die);
        dieDiv.setAttribute('index',ind);
        dieDiv.classList.add('cube',('d'+die))
        for(let i = 1; i <= die;i++){
            let dot = document.createElement('div');
            dot.classList.add('dot',('dot'+i));
            dieDiv.appendChild(dot);
        }
        dieDiv.onpointerdown = (e) =>{
            playerData.spendDie(dieDiv)

        }
        diceKey.appendChild(dieDiv);
        
    }

}