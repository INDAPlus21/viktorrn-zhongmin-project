import * as Util from './utility.js';
const diceKey = Util.$('diceHolder');
const planeCardKey = Util.$('planeCardHolder');
const starterCardKey = Util.$("startCard");
const scoreKey = Util.$("score")

export async function drawUI(inData){
    for(let data of inData.data){
        switch(data[0])
        {
            case 'drawPlayer':
                drawPlayer(data[1],data[2])
                break;
        }
    }
    return;
}

function drawPlayer(playerData,playerIndex)
{   
    if(playerIndex != playerData.id ) return
    //if(!playerData.needsToBeReDrawn) return;
    drawPlayerDice(playerData);
    drawPlayerPlaneCards(playerData);
    scoreKey.innerHTML = "Score: "+playerData.planesCompleted;


    let startCardDieContainer = starterCardKey.childNodes[3];
    
    //die is removed and readded each frame
    for(let cube of startCardDieContainer.getElementsByClassName("cube"))
    {
        startCardDieContainer.removeChild(cube);
    }
    
    if(playerData.spentDie != null)  
        drawPlayerStartCardDie(playerData);

    //hide highlight from startCard
    startCardDieContainer.childNodes[1].style.display = "none";
    if(playerData.dieSelected != null)
    {

        drawStartCardHighlight(playerData,startCardDieContainer);
    } 
        
      
}

function drawPlayerDice(playerData,playerIndex){
    
    Util.clearDOMElement(diceKey);
    for(let ind in playerData.dice){
        
        let die = playerData.dice[ind];
        let dieDiv = generateDieDiv(die);
        dieDiv.setAttribute('index',ind);

      
            dieDiv.onpointerdown = (e) =>{
                playerData.klickedDie(dieDiv)
    
            }
        
        
        if(playerData.dieSelected != null && ind == playerData.dieSelected.index) dieDiv.classList.add('selected')
        diceKey.appendChild(dieDiv);
    }
}

function drawPlayerPlaneCards(playerData){
    Util.clearDOMElement(planeCardKey);
    for(let ind in playerData.planes)
    {
        let plane = playerData.planes[ind];

        let card = document.createElement('div');
        let icon = document.createElement("div");
        let diceContainer = document.createElement("div");
        let addDie = document.createElement('span');

        addDie.classList.add("addDie");
        icon.classList.add("planeIcon");
        card.classList.add("planeCard");
        diceContainer.classList.add("diceContainer");

        card.setAttribute('index',ind);
        addDie.innerHTML = "+";
        
        diceContainer.appendChild(addDie);
        card.appendChild(icon);
        card.appendChild(diceContainer);
        planeCardKey.appendChild(card);

       
            if(playerData.dieSelected != null)
            {
                addDie.style.display = "block";
                diceContainer.onpointerdown = (e) =>
                {
                    playerData.klickedAddDieToPlane(ind);
                } 
            };
    
            if(plane.die != null) 
            {
                let dieDiv = generateDieDiv(plane.die);
                
                diceContainer.onpointerdown = (e) =>
                {
                    plane.klickedOnPlaneDie();
                }
                diceContainer.appendChild(dieDiv);
            }
      
        
    }
}

function drawPlayerStartCardDie(playerData){
    
    let die = playerData.spentDie;
    let dieDiv = generateDieDiv(die);
    starterCardKey.childNodes[3].appendChild(dieDiv);
}

function drawStartCardHighlight(playerData,startCardDieContainer){
    startCardDieContainer.childNodes[1].style.display = "block";
    startCardDieContainer.onpointerdown =(e) =>
    {
        playerData.klickedStartPlane(e);
    } 
}

function generateDieDiv(die){
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