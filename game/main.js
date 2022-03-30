
function $(e){return document.getElementById(e)}

boardTiles = [24,25,26,27,28,29,30,35,41,46,48,49,50,52,57,68,79,90,63,
            74,85,96, 91,92,93,94,95,59,61,70,71,72]
//start
window.onload = ()=> {
    let board = $('board');
    index = 0;
    for(i = 0; i < 11; i++){
        let tr = document.createElement('tr');
        for(j = 0; j < 11; j++){
            let td = document.createElement('td');
            
            if(i == 0 || i == 10 || j == 0 || j == 10 || boardTiles.includes(index) ){ 
                td.classList.add('tile')
                td.innerHTML = index;
                
            }
            index++;
            tr.appendChild(td)
         
        }
        board.appendChild(tr)
    }
    
}