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
        case 0: case '1':
            return "#A416DB";
        case 1: case '1':
            return "#DB5F00"
        case 2: case '2':
            return "#16C4DB"
        case 3: case '3':
            return "#A2DB18";
            
    }
}

export function getSVGpath(modell){
    switch(modell){
        case '1':
            return "M368.79,152.65c-11.42,7.39-89.13,34.58-89.13,34.58l-34.33.29-31.5,1.79h-.94L207.38,284l.78.17c3.3.82,32.66,19.25,32.66,19.25s3.3,5.6,2.41,14.48-4.7,12.18-9.91,15.64-18.43,5.92-37.11,6.58-36-10.37-36-10.37-2.92-2.47-4.82-13.82a16.21,16.21,0,0,1,7.49-16.62l29.11-15-.38-1.38L185.55,189l-16.35-.18-49.71-2.05S29.8,159.44,21.94,141.11,29.54,124,29.54,124l96.11,1.44,35.56,3.66h.23c19.71.41,22.22-5.79,22.22-5.79s.86-13.93.63-32.94c-.2-15.93,11-15.15,14.69-14.48v-.06l.43-5.37-27.66.21a71.37,71.37,0,0,1-7.34-1.34s0,0,0,0l-.79,0,.5-.05c-3.52-1-4.58-2.29,7.7-3.28l23.9.11s3.61-21.62,9.06-.28l24.22.42s22.15.71,0,4.24l-27.17-.14.39,5.49c15.8-2,13.93,12,13.93,12s-.73,25.51-.55,35.29,23.75,5.72,23.75,5.72l34.07-3.58s79.55-.71,96.67-1S380.2,145.26,368.79,152.65Z";
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