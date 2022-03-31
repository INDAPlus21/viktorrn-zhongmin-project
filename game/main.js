
function $(e){return document.getElementById(e)}

boardTiles = [24,25,26,27,28,29,30,35,41,46,48,49,50,52,57,68,79,90,63,
            74,85,96, 91,92,93,94,95,59,61,70,71,72]

plane = $('p1_plane1');
canvas = $('boardScreen');
velocity = 400;
shadowDistanceScaler = 30;
lightPos = {x:600,y:600}

function curve(startX,startY,endX,endY,bezX,bezY){
    
        
    var bezierX = startX +bezX
    var bezierY = startY +bezY
    var prevX = startX;
    var prevY = startY;
    var x = startX;
    var y = startY;

    for(var t=0.0;t<=1;t+=0.01)
    {
        prevX = x;
        prevY = y;
        x = (  (1-t)*(1-t)*startX + 2*(1-t)*t*bezierX+t*t*endX);
        y = (  (1-t)*(1-t)*startY + 2*(1-t)*t*bezierY+t*t*endY);
        
        connect(x,y,prevX,prevY,'green',3);
    }
}

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

document.onpointerdown = (e)=>{
    let planePos = plane.getBoundingClientRect();
    dist = getDist(planePos.x+55,planePos.y+55,e.clientX,e.clientY)
    
    distX = Math.abs(planePos.x -55 - e.clientX);
    distY = Math.abs(planePos.y -55 - e.clientY);

    plane.style.transition = "top "+ dist/velocity +"s linear, left "+ dist/velocity +"s linear"
    plane.style.top = e.clientY + -55 +'px';
    plane.style.left = e.clientX + -55 + 'px';
    while($('line')){
        document.body.removeChild($('line'));
    }
    curve( 280,280, 380,180 ,0,-50);
    curve( 480,80, 380,180 ,0,50);  
}

function drawShadow(plane){
   
    /*while($('line')){
        document.body.removeChild($('line'));
    }*/
    let planePos = plane.getBoundingClientRect();
    if(plane.getAttribute('prevX') == planePos.x &&  plane.getAttribute('prevY') == planePos.y) return;
    plane.setAttribute('prevX',planePos.x);
    plane.setAttribute('prevY',planePos.y);
    console.log("new")
    let lx = lightPos.x;
    let ly = lightPos.y;
    let shadowDiv = plane.childNodes[1];

    let dist = getDist(lx,ly,planePos.x+55,planePos.y+55)
    
    dist = dist < 1 ? 1 : dist
    
    let angle = Math.PI/2-Math.atan2(planePos.x+55-lx,planePos.y+55-ly)
    
    shadowDiv.style.top = dist/shadowDistanceScaler*Math.sin(angle) + 'px';
    shadowDiv.style.left = dist/shadowDistanceScaler*Math.cos(angle) + 'px';
    /*connect(
        planePos.x+55,
        planePos.y+55,
        planePos.x+55+ 100*Math.cos(angle),
        planePos.y+55+ 100*Math.sin(angle),
        'yellow',2)

    connect(lx,ly,planePos.x+55,planePos.y+55,'green',2)*/

}

function getDist(x1,y1,x2,y2){
    return Math.sqrt( (x2-x1)**2 + (y2-y1)**2 )
}

const connect = (x1,y1, x2,y2, color, thickness) => {  
  
    const length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
  
    const cx = ((x1 + x2) / 2) - (length / 2);
    const cy = ((y1 + y2) / 2) - (thickness / 2);
  
    const angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
  
    htmlLine = document.createElement('div')
    htmlLine.innerHTML = "<div style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />";
    htmlLine.id = 'line';
    document.body.appendChild(htmlLine) ;
  }

setInterval(()=>{
    drawShadow(plane)
}   ,100)
  