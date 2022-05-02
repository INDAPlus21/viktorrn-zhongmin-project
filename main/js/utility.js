export function $(e){return document.getElementById(e)}
export function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
          _x += el.offsetLeft - el.scrollLeft;
          _y += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
export function playerColors(index){
    switch(index){
        case 0 || '0':
            return "#A416DB";
        case 1 || '1':
            return "#DB5F00"
        case 2 || '2':
            return "#16C4DB"
        case 3 || '3':
            return "#A2DB18";
            
    }
}

export function getSVGpath(modell){
    switch(modell){
        
    }
}

export function linInterp(r1,r2,t){
    let r = r1 + (r2-r1)*(1-t);
    return r;
}

export function quadBezCurve(p0,p1,p2,t){
    let r = p1 + (1-t)*(1-t)*(p0-p1) + t*t*(p2-p1);
    return r;
}