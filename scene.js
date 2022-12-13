
function drawStars() {


    for(let i = 0; i < 4000; i++) {

        x = Math.random();
        y = Math.random();

        x_sign = Math.random() > 0.5;
        y_sign = Math.random() > 0.5;

        x = x_sign ? x : x * -1;
        y = y_sign ? y : y * -1;


        addPoint(x,y,0);
        val = noise.perlin2(5.0 * x, 5.0 * y)
        texture.push(val);
    }

}

function makeSphere (dx, dy, dz, orig_r, slices, stacks, isMoon) {
    
    let stackVal = 180/stacks;
    let sliceVal = 360/slices;

    let stackInc = 0;
    let r = orig_r;

    for (let stack = 0; stack < stacks; stack++) {
        stackInc += stackVal;
        let sliceInc = 0;
        for (let slice = 0; slice < slices; slice++) {

            if (stack == 0) {

                xl = r * Math.cos(radians(sliceInc % 360)) * Math.sin(radians(stackInc)) + dx;
                yl = r * Math.sin(radians(sliceInc % 360)) * Math.sin(radians(stackInc)) + dy;
                zl = r * Math.cos(radians(stackInc)) + dz;

                sliceInc += sliceVal;

                xr = r * Math.cos(radians(sliceInc % 360)) * Math.sin(radians(stackInc)) + dx;
                yr = r * Math.sin(radians(sliceInc % 360)) * Math.sin(radians(stackInc)) + dy;
                zr = r * Math.cos(radians(stackInc)) + dz;

                addTriangle(xl, yl, zl, xr, yr, zr, dx, dy, dz + r, isMoon);
                
            } else if (stack == stacks - 1){

                xl = r * Math.cos(radians(sliceInc % 360)) * Math.sin(radians(stackInc - stackVal)) + dx;
                yl = r * Math.sin(radians(sliceInc % 360)) * Math.sin(radians(stackInc - stackVal)) + dy;
                zl = r * Math.cos(radians(stackInc - stackVal)) + dz;

                sliceInc += sliceVal;

                xr = r * Math.cos(radians(sliceInc % 360)) * Math.sin(radians(stackInc - stackVal)) + dx;
                yr = r * Math.sin(radians(sliceInc % 360)) * Math.sin(radians(stackInc - stackVal)) + dy;
                zr = r * Math.cos(radians(stackInc - stackVal)) + dz;

                addTriangle(xr, yr, zr, xl, yl, zl, dx, dy, dz - r, isMoon);

            } else {

                xbl = r * Math.cos(radians(sliceInc % 360)) * Math.sin(radians(stackInc)) + dx;
                ybl = r * Math.sin(radians(sliceInc % 360)) * Math.sin(radians(stackInc)) + dy;
                zbl = r * Math.cos(radians(stackInc)) + dz;


                xtl = r * Math.cos(radians(sliceInc % 360)) * Math.sin(radians(stackInc - stackVal)) + dx;
                ytl = r * Math.sin(radians(sliceInc % 360)) * Math.sin(radians(stackInc - stackVal)) + dy;
                ztl = r * Math.cos(radians(stackInc - stackVal)) + dz;

                sliceInc += sliceVal;

                xbr = r * Math.cos(radians(sliceInc % 360)) * Math.sin(radians(stackInc)) + dx;
                ybr = r * Math.sin(radians(sliceInc % 360)) * Math.sin(radians(stackInc)) + dy;
                zbr = r * Math.cos(radians(stackInc)) + dz;

                xtr = r * Math.cos(radians(sliceInc % 360)) * Math.sin(radians(stackInc - stackVal)) + dx;
                ytr = r * Math.sin(radians(sliceInc % 360)) * Math.sin(radians(stackInc - stackVal)) + dy;
                ztr = r * Math.cos(radians(stackInc - stackVal)) + dz;

                let bl = [xbl, ybl, zbl];
                let tl = [xtl, ytl, ztl];
                let br = [xbr, ybr, zbr];
                let tr = [xtr, ytr, ztr];

                tessellateRectangle(bl, br, tr, tl, 1, isMoon);
            }
        }
    }

}

function tessellateRectangle(bl, br, tr, tl, height, isMoon) {

    let newBl, newBr, newTr, newTl;

    if (height == 1) {
        addTriangle(bl[0], bl[1], bl[2], br[0], br[1], br[2], tl[0], tl[1], tl[2], isMoon);
        addTriangle(br[0], br[1], br[2], tr[0], tr[1], tr[2], tl[0], tl[1], tl[2], isMoon);
    } else {
        let heightInc = 1/height;
        for( i = 0; i < height; i++) {
            newBl = midPoint(bl, tl, heightInc - 1/height);
            newBr = midPoint(br, tr, heightInc - 1/height);
            newTl = midPoint(bl, tl, heightInc);
            newTr = midPoint(br, tr, heightInc);

            tessellateRectangle(newBl, newBr, newTr, newTl, 1, isMoon);
            heightInc += 1/height;
        }
    }
   
}


function midPoint (p1, p2, ratio){
    m = []
    for (let i = 0; i < 3; i++) {
        m[i] = ((1 - ratio) * p1[i]) + (p2[i] * ratio)
    }
    return m;
}


function mainPlanet(x, y, z) {

    noiseVal = 
        1.2 * noise.perlin3(2.0 * x, 2.0 * y, 2.0 * z) + 
        0.3 * noise.perlin3(4.0 * x, 4.0 * y, 4.0 * z) + 
        0.3 * noise.perlin3(8.0 * x, 8.0 * y, 8.0 * z) + 
        0.2*  noise.perlin3(16.0 * x, 16.0 * y, 16.0 * z);
    texture.push(noiseVal/2);

}

function moon(x,y,z) {
    noiseVal = 
        1 * noise.perlin3(8.0 * x, 8.0 * y, 8.0 * z) + 
        0.7 * noise.perlin3(16.0 * x, 16.0 * y, 16.0 * z) + 
        0.3 * noise.perlin3(32.0 * x, 32.0 * y, 32.0 * z);

    let val = (noiseVal + 0.8)/2.8
    texture.push(val);
}

function radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function addTriangle (x0,y0,z0,x1,y1,z1,x2,y2,z2, isMoon) {
    
    var nverts = points.length / 4;
    
    // push first vertex
    points.push(x0);  bary.push (1.0);
    points.push(y0);  bary.push (0.0);
    points.push(z0);  bary.push (0.0);
    points.push(1.0);
    indices.push(nverts);
    isMoon ? moon(x0, y0, z0) : mainPlanet(x0,y0,z0) ;
    nverts++;
    
    // push second vertex
    points.push(x1); bary.push (0.0);
    points.push(y1); bary.push (1.0);
    points.push(z1); bary.push (0.0);
    points.push(1.0);
    indices.push(nverts);
    isMoon ? moon(x1,y1,z1) : mainPlanet(x1,y1,z1);
    nverts++
    
    // push third vertex
    points.push(x2); bary.push (0.0);
    points.push(y2); bary.push (0.0);
    points.push(z2); bary.push (1.0);
    points.push(1.0);
    indices.push(nverts);
    isMoon ? moon(x2,y2,z2) : mainPlanet(x2,y2,z2);
    nverts++;
}

function addPoint(x, y, z) {
    var nverts = points.length / 4;
    points.push(x);  bary.push (1.0);
    points.push(y);  bary.push (0.0);
    points.push(z);  bary.push (0.0);
    points.push(1.0);
    indices.push(nverts);
    nverts++;
}

