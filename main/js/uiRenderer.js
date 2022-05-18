import * as Util from './utility.js';
const diceKey = Util.$('diceHolder');
const planeCardKey = Util.$('planeCardHolder');

export async function drawUI(inData){
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
    //if(!playerData.needsToBeReDrawn) return;
    Util.clearDOMElement(diceKey);
    for(let ind in playerData.dice){
        
        let die = playerData.dice[ind];
        let dieDiv = generateDie(die);
        dieDiv.setAttribute('index',ind);

        dieDiv.onpointerdown = (e) =>{
            playerData.klickedDie(dieDiv)

        }
        if(playerData.dieSelected != null && ind == playerData.dieSelected.index) dieDiv.classList.add('selected')
        diceKey.appendChild(dieDiv);
    }

    Util.clearDOMElement(planeCardKey);
    for(let ind in playerData.planes){
        let card = document.createElement('div');
        card.setAttribute('index',ind);
        card.classList.add("planeCard");
        let icon = document.createElement("div");
        let diceContainer = document.createElement("div");
        let addDie = document.createElement('span');
        addDie.innerHTML = "+";
        addDie.classList.add("addDie");
        icon.classList.add("planeIcon");
        diceContainer.classList.add("diceContainer");
        diceContainer.appendChild(addDie);
        card.appendChild(icon);
        card.appendChild(diceContainer);
        planeCardKey.appendChild(card);

        if(playerData.dieSelected == null) continue;
            addDie.style.display = "block";
            diceContainer.onpointerdown = (e,ind) =>
            {
                playerData.klickedAddDieToPlane(index);
            } 

        if(playerData.planes.die != null)
        {

        }
    }
    Util.$("startCard").childNodes[3].childNodes[1].style.display = "none";
    
    if(playerData.dieSelected == null) return;
    Util.$("startCard").childNodes[3].childNodes[1].style.display = "block";

    Util.$("startCard").childNodes[3].onpointerdown =(e) =>
    {
        playerData.klickedStartPlane();
    } 

    if(playerData.spentDie == null) return
    
    let die = playerData.dice[playerData.spentDie.index];
    let dieDiv = generateDie(die);
    Util.$("startCard").childNodes[3].appendChild(dieDiv);
    

    


}

function generateDie(die){
    let dieDiv = document.createElement('div');
    dieDiv.setAttribute('value',die);
    dieDiv.classList.add('cube',('d'+die))
    
    for(let i = 1; i <= die;i++){
        let dot = document.createElement('div');
        dot.classList.add('dot',('dot'+i));
        dieDiv.appendChild(dot);
    }
    return dieDiv;
}