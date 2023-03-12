const canvas= document.getElementById("mondriantetris");
const context= canvas.getContext('2d');

const style = canvas.style;
style.marginLeft = "auto";
style.marginRight = "auto";
const parentStyle = canvas.parentElement.style;
parentStyle.textAlign = "center";
parentStyle.width = "100%";

context.scale(20,20);

function eliminateRow(){
    let rowCounter = 1;
    outer: for (let y = arena.length -1; y > 0; --y){ //iterates y
        for(let x = 0; x < arena[y].length; ++x){ //iterates x
            if(arena[y][x] === 0) { // not full yet --> as soon as a spot is found it goes on to the next row
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0); //takes out row at index y and fills it with 0s
        arena.unshift(row);//places empty row at the top of the arena
        ++y;//to replace removed y

        player.score += rowCounter * 10;
    }
}

const matrix = [
    [0,0,0],
    [0,0,0],
    [0,0,0],
];

// desribe collision
function collision(arena, player){
    const m = player.matrix;
    const o = player.pos;
    for(let y = 0; y< m.length; ++y){
        for(let x= 0; x< m[y].length; ++x){
            if(m[y][x] !== 0 &&
                (arena [y+ o.y] &&
                arena [y+ o.y][x + o.x])!== 0){
                    return true;
            };
        };
    };
    return false;
};

// matrix for arena
function createMatrix(w,h){
    const matrix = [];
    while (h--){
        matrix.push(new Array(w).fill(0))
    }
    return matrix;
}

function createTetra(type){
    if (type === 'Z'){
        return[
            [1,1,0],
            [0,1,1],
            [0,0,0]
        ];
    }else if( type === 'S'){
        return[
            [0,2,2],
            [2,2,0],
            [0,0,0]
        ];
    }else if( type === 'J'){
        return[
            [0,3,0],
            [0,3,0],
            [3,3,0]
        ];
    }else if( type === 'L'){
        return[
            [0,4,0],
            [0,4,0],
            [0,4,4]
        ];
    }else if( type === 'T'){
        return[
            [5,5,5],
            [0,5,0],
            [0,0,0]
        ];
    }else if( type === 'I'){
        return[
            [0,6,0,0],
            [0,6,0,0],
            [0,6,0,0],
            [0,6,0,0]
        ];
    }else if( type === 'O'){
        return[
            [0,0,0,0],
            [0,7,7,0],
            [0,7,7,0],
            [0,0,0,0]
        ];
    };
};

//black square backround --> arena
function draw() {
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    drawMatrix(arena, {x:0, y:0});
    drawMatrix(player.matrix, player.pos);
}

// draw tetra
function drawMatrix(matrix, offset){
 matrix.forEach((row, y) => {
     row.forEach((value, x) =>{
         if(value !== 0) {            
             context.fillStyle = '#000';
             context.fillRect(x+ offset.x,
                              y+ offset.y,
                              1, 1)
             context.fillStyle = colors[value];
             context.fillRect(x+ offset.x + 0.2,
                              y+ offset.y+ 0.2,
                              0.8, 0.8)
            }
        });
    });
};

const colors = [
    null,
    '#CD0009',//red
    '#F7CE03',
    '#354379',
    '#CD0009',
    '#354379',//blue
    '#CD0009',
    '#F7CE03',//yellow
];

function merge (arena, player){
    player.matrix.forEach((row, y)=>{
        row.forEach((value, x)=>{
            if (value !== 0){
                arena[y+ player.pos.y][x+ player.pos.x] = value;
            };
        });
    });
};


//collision "walls"
function playerDrop() {
    player.pos.y++; 
    if (collision(arena, player)){
        player.pos.y--;
        merge(arena, player);
        playerNew();
        eliminateRow();
        updateScore();
    }
    dropCounter = 0;
}

//collision "floor" or other tetra
function playerMove(dir) {
    player.pos.x += dir;
    if (collision(arena, player)){
        player.pos.x -= dir;
    };
};

function playerNew(){
    const tetras = 'ZSJLTIO'
    player.matrix = createTetra(tetras[tetras.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                    (player.matrix[0].length / 2 | 0);
    if (collision(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
};

function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while(collision(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));// causes it to jump back--> calculates spaces to wall
        if (offset > player.matrix[0].length){
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
};

function rotate(matrix, dir) {
    for (let y= 0; y< matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0){
        matrix.forEach(row => row.reverse());
    }else {
        matrix.reverse();
    }
}

//drop of tetra
let dropCounter= 0
let dropInterval= 1000

let lastTime= 0
function update(time= 0) {
    const deltaTime = time - lastTime;
    lastTime=time;

    dropCounter+= deltaTime;
    if(dropCounter > dropInterval){
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function updateScore(){
    document.getElementById('score').innerText = player.score;
}

//arena
const arena = createMatrix(5, 10);

//position of tetra at beginning  of game
const player ={
    pos:{x:0,y:0},
    matrix: null,
    score: 0,
}

//key commands
document.addEventListener('keydown', event =>{
    if(event.keyCode === 37){
        playerMove(-1);
    }else if(event.keyCode === 39){
        playerMove(+1);
    }else if(event.keyCode ===40){
        playerDrop();
    }else if(event.keyCode ===81){
        playerRotate(-1);
    }else if(event.keyCode ===87){
        playerRotate(+1);
    };
});

playerNew();
update();
