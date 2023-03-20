let socket;
let multiplayer = false;
let ratio;

$.get(`/socket.io/socket.io.min.js`)
    .done(function () {
        let sc = document.createElement("script");
        sc.setAttribute("src", "/socket.io/socket.io.min.js");
        sc.setAttribute("type", "text/javascript");
        document.head.appendChild(sc);

        socket = io();
        socket.on('connect', () =>{
            console.log(socket);
        });
        multiplayer = localStorage.getItem("multiplayer") ?? false;
        socket.on('playerdata', (data) =>{
            /*
            ratio = {
                "width": width/data.width,
                "height": height/data.height
            };
            players[1].position.y = data.player.y*ratio.height;
            players[1].position.x = data.player.x*ratio.width + data.offset*ratio.width - scrollOffset;
            */
            players[1].position.y = data.player.y;
            players[1].position.x = data.player.x + data.offset - scrollOffset;
            console.log(players)
            if(level < data.level){
                level = data.level;
                players[0].position.x = startscrollR;
                players[0].position.y = height/10;
                levelSwitch();
            }
        });
    }).fail(function () {
        multiplayer = false;
    });
/*
console.log(window.location)
let locationString = `${window.location}`;
let noScript = false;                                                                                         //baba seiten detection
if(locationString.substring(locationString.length-10, locationString.length) == 'index.html')noScript = true;
else noScript = false;
*/
// CUSTOMIZEABLE
/*localStorage.setItem('charface', ':D');
if(localStorage.getItem("charface"))let charface = localStorage.getItem("charface");
else let charface;
*/
let text = localStorage.getItem("charface") ?? ":)";//
let playercolor = localStorage.getItem("playercolor") ?? '#000';
let platcolor = localStorage.getItem("platcolor") ?? '#000';
let platshadow = localStorage.getItem("platshadow") ?? '#fff';
let playerrainbow = JSON.parse(localStorage.getItem("playerrainbow")) ?? true;
let platrainbow = JSON.parse(localStorage.getItem("platrainbow")) ?? false;
let speedmode = localStorage.getItem("speedmode") ?? false;
let darktheme = localStorage.getItem("darktheme") ?? false;
let difficulty = localStorage.getItem("difficulty") ?? 'normal';
let playernum = parseInt(localStorage.getItem("playernum")) ?? 1;
let buttonpressed = false;
let gamepad = false;
let gamepadIndex;
let pcounter = 0;
// --------------- //
/*                                                  add locallocalStorage speicherung bitte wär wild (coins + lvl??)
const width = innerWidth*0.8;
const height = innerHeight*0.6;
*/


const baseWidth = 1920;
const baseHeight = 1080;

let width = innerWidth;
let height = innerHeight;
const fps = 60;

console.log('basewidth: ' + width)
console.log('baseheight: ' + height)


// lets/consts to make values
let counter = 0;

let startscrollR = width*0.4;
let startscrollL = width*0.15;
let scrollOffset = 0;
let distance = 0;
let lvldistance = 0;
let winx = width*3;


let multi = 0.0025*2;//0.0025


let gravity = height / 1700*5;
let speed = width*multi;
let jumpforce = height*(multi-0.0005)*10;

/*
let multi = 0.006875;//0.006875

let gravity = 4.5;//4.5
let speed = 0.275;//0.275
let jumpforce = 55;//55
*/   
/*
let multi = 0.006875;//0.006875

let gravity = 4.5;//4.5
let speed = 0.275;//0.275
let jumpforce = 55;//55
*/
if(speedmode){
    multi = 0.006875;//0.006875

    gravity = 4.5;//4.5
    speed = 0.275;//0.275
    jumpforce = 55;//55
}

let level = localStorage.getItem("level") ?? 0;
let lvlcoins = 0;
let coins = localStorage.getItem("coins") ?? 0;
let attempt = localStorage.getItem("attempts") ?? 1;
let allattempts = localStorage.getItem("allattempts") ?? 1;
//let tempcoin;
let dead = false;
let menu = false;
let reassigned = false;

// TEXT

// MUSIC && SOUNDS
let backgroundmusic = document.getElementById('music');
backgroundmusic.src = 'music/Space8bit.mp3';
backgroundmusic.currentTime = 0.25;
//const backgroundmusic = new Audio('../music/Space8bit.mp3');
function playMusic(){
    backgroundmusic.addEventListener("canplay", event => {  // zu einzelnen lvls?
        backgroundmusic.volume = 0.8;
        backgroundmusic.controls = true;
        backgroundmusic.play();
    });
}

// coin sounds

coinCollect = new Audio('music/CoinCollect.mp3');
coinCollect.volume = 0.4;


// ITEMS
let coinload = false;
const coin = new Image(); //onload zeile 437 :D

let checkpointload = false;
const checkpoint = new Image(); //onload zeile 652 :D

// CANVAS
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
//SET width height (window.inner----)
canvas.width = width;
canvas.height = height;
// KEY stuff

//listenersis
function clickmenu(){
    if(menu) closeMenu();
    else userMenu();
}

// FULLSCWEEN

//mobile stuff
let mobile = false; 
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    mobile = true;
    document.getElementById('right').addEventListener("touchstart", mobileRight);
    document.getElementById('right').addEventListener("touchend", mobileStop);
    
    document.getElementById('left').addEventListener("touchstart", mobileLeft);
    document.getElementById('left').addEventListener("touchend", mobileStop);

    document.getElementById('mobileJump').addEventListener('touchstart', mobileJump);
    document.getElementById('mobileJump').addEventListener('touchend', stopJump);

    document.getElementById('audiotags').innerHTML = '';
    
    Array.from(document.getElementsByClassName('nomobile')).forEach(x => {
        x.innerHTML = '';
    });
}else{
    document.getElementById('mobile').innerHTML = '';
    /*
    document.getElementById('right').addEventListener("mousedown", mobileRight);
    document.getElementById('right').addEventListener("mouseup", mobileStop);
    
    document.getElementById('left').addEventListener("mousedown", mobileLeft);
    document.getElementById('left').addEventListener("mouseup", mobileStop);
    
    document.body.addEventListener('mousedown', mobileJump);
    */
}

//OOP because OP for this
class Player{
    constructor(leader){
        this.position = {
            x: width/15,
            y: height/10
        };
        this.velocity = {
            x: 0,
            y: 0
        }
        this.keys = {
            right: false,
            left: false,
            jump: false,
            sprint: false,
            sneak: false
        };
        this.reassign={jump: 32, left: 65, right: 68, down: 83, sneak: 17, sprint: 16};//{down: 83, jump: 32, left: 65, right: 68, sneak: 17, sprint: 16};
        this.leader = leader ?? false;
        this.dead = false;
        this.width = width/38.4;
        this.height = width/38.4;
    }

    draw(){
        counter ++;
        if(platrainbow && playerrainbow && counter >= (100*players.length)){
            counter = 0;
            //playercolor = `${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}`;
            playercolor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
            platshadow = playercolor;
        }
        if(!platrainbow && playerrainbow && counter >= (100*players.length)){
            counter = 0;
            //playercolor = `${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}`;
            playercolor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
        }
        if(!playerrainbow && platrainbow && counter >= (100*players.length)){
            counter = 0;
            //platshadow = `${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}`;
            platshadow = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
        }
        ctx.shadowColor = `${playercolor}`;
        ctx.fillStyle = `${playercolor}`;
        ctx.shadowBlur = 180;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

        //if(text.length <= 2){
            ctx.shadowBlur = 0;
            ctx.font = `${width/55}px`;
            ctx.fillStyle = '#202124';
            ctx.fillText(text, this.position.x+this.width*0.1, this.position.y+this.height*0.7);
        //}
    }

    update(){
        //this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if((this.position.y + this.height + this.velocity.y) <= canvas.height){
            this.velocity.y += gravity;
        }
    }
}

class Platform{
    constructor(x, y, width, height){
        this.position = {
            x,
            y
        };
        this.width = width ?? innerWidth*0.2;
        this.height = height ?? innerHeight*0.02;
    }

    draw(){
        //if(platrainbow)ctx.shadowColor = playercolor;
        //else ctx.shadowColor = platshadow;
        ctx.shadowColor = platshadow;
        ctx.shadowBlur = 5;
        ctx.fillStyle = platcolor;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Item{
    constructor(x, y, img, width, height){
        this.position = {
            x,
            y,
        };
        this.img = img ?? coin;
        this.width = width ?? innerWidth/48;
        this.height = height ?? innerWidth/48;
    }

    draw(){
        if(difficulty != 'impossible') ctx.shadowColor = 'gold';
        else ctx.shadowColor = '#000';
        ctx.shadowBlur = 80;
        ctx.drawImage(this.img, this.position.x, this.position.y, this.width, this.height);
    }
}
/*class Text{
    constructor(text, x, y, width){
        this.position = {
            x,
            y,//jwnejgfkhqwurghqwuiropghoeuiprwghuoeirgherughpu
        };
        this.text = text ?? 'placeholder gays';
        this.width = width ?? innerWidth/48;
    }

    draw(){
        ctx.shadowBlur = 0;
        ctx.font = `${this.width}px Cascadia Code`;
        ctx.fillStyle = '#fff';
        ctx.fillText(`${this.text}`, x, y);
    }
}
*/
let players = [new Player(true)];
for(let i = 1; i < playernum; i++){
    players[i] = new Player();
}
if(localStorage.getItem("players") != undefined){
    let max;
    if(players.length < JSON.parse(localStorage.getItem("players")).length) max = players.length;
    else max = JSON.parse(localStorage.getItem("players")).length;
    for(let i = 0; i < max; i++){
        players[i].reassign = JSON.parse(localStorage.getItem("players"))[i].reassign;
    }
}


let platforms = [];
let items = [];
let alltext;

function level0(){
    winx = width*1.5;
    platforms = [
        new Platform(0, height*0.8, width*2, height*0.2),
        
        
        new Platform(width*0.05, height*0.4, width*0.05),
        new Platform(width*0.15, height*0.5, width*0.05),
        new Platform(width*0.25, height*0.6, width*0.05),
        new Platform(width*0.35, height*0.7, width*0.05),


        new Platform(width*0.7, height*0.6, width*0.2),
        new Platform(width*1.2, height*0.6, width*0.2),
        new Platform(width*1.7, height*0.6, width*0.2)
        /*
        new Platform(width*0.5, height*0.7, width*0.05),
        new Platform(width*0.6, height*0.6, width*0.05),
        new Platform(width*0.7, height*0.5, width*0.05),
        new Platform(width*0.8, height*0.4, width*0.05)
        */
    ];

    //addText(width*1.7, height*0.6);
    /*alltext = [
        new Text(`${reassign.sprint} to Sprint`, width*0.6, height*0.5),

    ];*/

    items = [
        
        //new Item(width*0.165, height*0.3, checkpoint, innerWidth/48, innerWidth/48),

        new Item(width*0.165, height*0.4, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.265, height*0.5, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.365, height*0.6, coin, innerWidth/48, innerWidth/48)

        /*
        new Item(width*0.51, height*0.6, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.61, height*0.5, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.71, height*0.4, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.81, height*0.3, coin, innerWidth/48, innerWidth/48)
        */
    ];
}
function level1(){
    winx = width*3;
    platforms = [
        new Platform(0, height*0.8, width*0.5 , height*0.2),
        new Platform(width, height*0.8, width*0.5, height*0.2),
        new Platform(width*2, height*0.8, width*0.5, height*0.2),
        new Platform(width*3, height*0.8, width*0.5, height*0.2),

        new Platform(width*0.6, height*0.75, width*0.3),
        new Platform(width*1.6, height*0.75, width*0.3),
        new Platform(width*2.6, height*0.75, width*0.3),
    ];

    items = [
        new Item(width*0.95, height*0.45, coin, innerWidth/48, innerWidth/48),

        new Item(width*1.25, height*0.74, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.95, height*0.45, coin, innerWidth/48, innerWidth/48),

        new Item(width*2.25, height*0.74, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.95, height*0.45, coin, innerWidth/48, innerWidth/48),
    ];
}
// hi C:D
function level2(){
    winx = width*3;
    platforms = [
        new Platform(0, height*0.8, width*0.5 , height*0.2),
        new Platform(width, height*0.8, width*0.5, height*0.2),     // base platform - do over 15 when not let thru IS FALSCH IWIE klar is des falsch retard
        new Platform(width*2, height*0.8, width*0.5, height*0.2),
        new Platform(width*3, height*0.8, width*0.5, height*0.2),

        
        new Platform(width*0.6, height*0.45, width*0.3),
        new Platform(width*0.6, height*0.75, width*0.3),
        new Platform(width*1.6, height*0.75, width*0.3),
        new Platform(width*2.6, height*0.75, width*0.3)
    ];

    items = [
        new Item(width*0.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.95, height*0.45, coin, innerWidth/48, innerWidth/48),

        new Item(width*1.25, height*0.74, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.95, height*0.45, coin, innerWidth/48, innerWidth/48),

        new Item(width*2.25, height*0.74, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.95, height*0.45, coin, innerWidth/48, innerWidth/48),
    ];
}

function level3(){
    winx = width*3.5;
    platforms = [
        new Platform(0, height*0.8, width*0.5 , height*0.2),

        new Platform(width*0.65, height*0.7, width*0.1, height*0.015),
        new Platform(width*0.9, height*0.5, width*0.1, height*0.015),

        new Platform(width*1.15, height*0.3, width*0.2, height*0.015),

        new Platform(width*1.5, height*0.5, width*0.1, height*0.015),
        new Platform(width*1.75, height*0.7, width*0.1, height*0.015),

        //Platform
        new Platform(width*2.1, height*0.81, width*0.025 , height*0.2),
        new Platform(width*2.4, height*0.81, width*0.025 , height*0.2),
        new Platform(width*2, height*0.8, width*0.5 , height*0.05),
        /*-------*/



        new Platform(width*2.6, height*0.9, width*0.1, height*0.015),
        new Platform(width*2.75, height*0.995, width*0.1, height*0.015),
        new Platform(width*3.05, height*0.85, width*0.1, height*0.015),
        
        new Platform(width*3.3, height*0.8, width*0.7, height*0.2)
    ];

    items = [
        new Item(width*0.69, height*0.6, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.94, height*0.4, coin, innerWidth/48, innerWidth/48),
        
        new Item(width*1.05, height*0.25, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.4, height*0.3, coin, innerWidth/48, innerWidth/48),

        new Item(width*1.79, height*0.64, coin, innerWidth/48, innerWidth/48),        
        new Item(width*2.1, height*0.5, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.4, height*0.74, coin, innerWidth/48, innerWidth/48),
    ];
}

function randomGen(){// test
    //import in loop mach vllt doch ned ned so gut ig
    //if(distance >= width*14,5) level = 69; // wandom lvls

    
    //work kinda
    /*const platpos = {
        x: 0,
        y: 0
    };
    
    platforms[0] = new Platform(0, height*0.8, width*0.5, height*0.2);
    for(let i = 1; i < 9; i++){
        let b4x = platpos.x;
        platpos.x += Math.random() * (0.9 - 0.5) + 0.5;
        if(platpos > 0.86)platpos.y = Math.random() * (0.99 - 0.8) + 0.8;
        else platpos.y = Math.random() * (0.99 - 0.47) + 0.47;
        
        platforms[i] = new Platform(width * platpos.x, height * platpos.y, width*Math.random() * (1 - 0.2) + 0.2, height*Math.random() * (1 - 0.015) + 0.015);
    }
    platforms[9] = new Platform(width*3.3, height*0.8, width*0.9, height*0.2);
    */
    
    //working best aber halt ohne gewichter
    items.length = 0;
    if(Math.random() > 0.5){
    const platpos = {
        x: 0,
        y: 0.8
    };
    const coinpos = {
        x: 0,
        y: 0
    };
    const platdim = {
        x: 0.5,
        y: 0.2
    };

    platforms[0] = new Platform(0, height*0.8, width*0.5, height*0.2);
    for(let i = 1; i < 9; i++){
        platpos.x = Math.random() * ((platpos.x  + platdim.x)+ 0.28 - (platpos.x  + platdim.x)) + (platpos.x  + platdim.x);
        platpos.y = Math.random() * (0.99 - (platpos.y-0.25)) + (platpos.y-0.25);

        platdim.x = Math.random() * (1 - 0.2) + 0.2;
        platdim.y = Math.random() * (1 - 0.015) + 0.015;

        platforms[i] = new Platform(width * platpos.x, height * platpos.y, width*platdim.x, height*platdim.y);

        //COINS man
        if(difficulty != 'run'){
            for(let j = 0; j < Math.floor(Math.random()*5); j++){
                coinpos.x = Math.random() * (platforms[i].width+platforms[i].position.x - platforms[i].position.x) + platforms[i].position.x;
                coinpos.y = Math.random() * (platforms[i].position.y-0.06*height - (platforms[i].position.y-0.3*height)) +  (platforms[i].position.y-0.3*height);
                items[i+j] = new Item(coinpos.x, coinpos.y, coin, innerWidth/48, innerWidth/48);
            }
        }
    }
    platforms[9] = new Platform(platforms[8].position.x+platforms[8].width + (Math.random()*0.3), height*0.8, width*0.5, height*0.2);

    winx = platforms[9].position.x;
    }else{
    //gewichter try
    const platpos = {
        x: 0,
        y: 0.8
    };
    const coinpos = {
        x: 0,
        y: 0
    };
    const platdim = {
        x: 0.5,
        y: 0.2
    };

    platforms[0] = new Platform(0, height*0.8, width*0.5, height*0.2);
    for(let i = 1; i < 9; i++){
        platpos.x = Math.random() * ((platpos.x  + platdim.x)+0.28 - (platpos.x  + platdim.x)) + (platpos.x  + platdim.x);
        platpos.y = Math.random() * (0.99 - (platpos.y-0.25)) + (platpos.y-0.25);

        platdim.x = Math.random() * (0.3 - 0.1) + 0.1;
        platdim.y = Math.random() * (0.025 - 0.015) + 0.015; 
        platforms[i] = new Platform(width * platpos.x, height * platpos.y, width*platdim.x, height*platdim.y);

        //COINS man
        if(difficulty != 'run' && Math.random() > 0.5){
            coinpos.x = Math.random() * (platforms[i].width+platforms[i].position.x - platforms[i].position.x) + platforms[i].position.x;
            coinpos.y = Math.random() * (platforms[i].position.y-0.06*height - (platforms[i].position.y-0.3*height)) +  (platforms[i].position.y-0.3*height);
            items[i] = new Item(coinpos.x, coinpos.y, coin, innerWidth/48, innerWidth/48);
        } 
    }
    platforms[9] = new Platform(platforms[8].position.x+platforms[8].width + (Math.random()*0.3), height*0.8, width*0.5, height*0.2);

    winx = platforms[9].position.x;
    }
    //items impimentieren wandom auf plat iwo in bestimmter höhe und random anzahl pro platform (?je nach breite)
    /*    items = [
        new Item(width*0.365, height*0.6, coin, innerWidth/48, innerWidth/48)
    ];*/
}

function levelSwitch(){
    //randomGen();
    if(difficulty == "run"){
        randomGen();
        return;
    }
    switch(level){
        case 0:
            level0();
            break;
        case 1:
            level1();
            break;
        case 2:
            level2();
            break;
        case 3:
            level3();
            break;
        default:
            randomGen();
            break;
    }
}

function addText(text, x, y){
    ctx.shadowBlur = 0;
    ctx.fillStyle = platcolor;
    ctx.font = `${width/55}px Cascadia Code`;
    ctx.fillStyle = '#fff';
    ctx.fillText(text, x, y);
}

function draw(){
    if (!dead && !menu && coinload) requestAnimationFrame(draw);
        
    if(innerWidth != width /*&& !multiplayer*/){
        width = innerWidth;
        console.log('width: ' + width)
        startscrollR = width*0.4;
        startscrollL = width*0.15;
        canvas.width = width;
        //winx = width*3;
        speed = width*multi;
        levelSwitch();
    }                                                           //mach änderererer
    if(innerHeight!= height /*&& !multiplayer*/){
        console.log('height: ' + height)
        height = innerHeight;
        canvas.height = height;
        jumpforce = height*(multi-0.0005)*10;
        levelSwitch();
    }
    

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    players.forEach(player => {
        player.draw();
    });
    
    platforms.forEach(platform => {
        platform.draw();
    });
    
    items.forEach(item => {
        item.draw();
    });
    /*alltext.forEach(item => {
        item.draw();
    });*/
    addText(`Attempt: ${attempt}`, width*0.8, height*0.9);
    

    /*for(let i = 0; i < players.length; i++){
        if(!players[i].dead){
            break;
        }
        if(i == players.length-1){//uhuwropvhöierhjpviohewrvupoerhjfiojewiof!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            gameOver();
        }
    }*/
    //update();

    ctx.restore();
}
let clickcount = 0;
function update(){
    if (!dead && !menu && coinload) setTimeout(update, 1000/fps);

    updateCameraPosition();   
    if(!mobile && gamepad && gamepadIndex !== undefined){
        const myGamepad = navigator.getGamepads()[gamepadIndex];
        myGamepad.buttons.map(e => e.touched).forEach((isPressed, buttonIndex) => {
            
            if (isPressed) {
                // button is pressed; indicate this on the page
                console.log(`Button ${buttonIndex} is pressed`);
                if(buttonIndex === 0 || buttonIndex === 1 || buttonIndex === 12){
                    players[0].keys.jump = true;
                    console.log("jump")
                }
                if(buttonIndex === 13){
                    players[0].keys.down = true;      
                    players[0].velocity.y += 15;
                }
                if(buttonIndex === 4){
                    players[0].keys.sprint = true;
                }
                if(buttonIndex === 15){
                    players[0].keys.right = true;
                }
                if(buttonIndex === 14){
                    players[0].keys.left = true;
                }
                /*if(!menu && buttonIndex === 8){
                    setTimeout(userMenu(), 500);
                }else if(buttonIndex === 8){
                    setTimeout(closeMenu(), 500);
                }*/
                if(buttonIndex === 9){
                    window.location.assign('index.html');
                }

            }
            if(!isPressed){
                setTimeout(function(){

                    players[0].keys.jump = false;
                    players[0].keys.left = false;
                    players[0].keys.right = false;
                    players[0].keys.sprint = false;                    
                    players[0].keys.down = false;
                }, 0); 
                    
            }
        });
                
    }
    

    /*if(Gamepad.pressed(0, "FACE_1")) {
        console.log('Pressed!');
    }else{
        console.log('0');
    }*/

    players.forEach(player => {
        if(difficulty == 'run') player.keys.left = false;
        if(difficulty == 'run') player.keys.right = true;
        player.update();
    });
    players.forEach(player => {
        if(player.leader){
            if(player.keys.jump && player.velocity.y == gravity){
                player.velocity.y -= jumpforce; // double jump mit counter <= 2 ig
            }
            if(player.keys.sprint){
                speed = width*(multi*2.24); //                                                             inc
            }else if(player.keys.sneak){
                speed = width*(multi*0.1);
            }else{
                speed = width*multi;
            }
            if(player.keys.right && player.position.x < startscrollR){
                player.velocity.x = speed;
            }else if(player.keys.left && player.position.x > startscrollL){
                player.velocity.x = speed *-1;
            }else if(player.leader){
                player.velocity.x = 0;
                if(player.keys.right){
                    //console.log(speed)
                    scrollOffset += speed;
                    distance += speed;
                    platforms.forEach(platform => {
                        platform.position.x -= speed;
                    });
                    
                    items.forEach(item => {
                        item.position.x -= speed;
                    });

                    players.forEach(player => {
                        if(!player.leader) player.position.x -= speed;
                    });
                }else if(player.keys.left){
                    scrollOffset -= speed;
                    distance -= speed;
                    platforms.forEach(platform => {
                        platform.position.x += speed;
                    });
                    
                    items.forEach(item => {
                        item.position.x += speed;
                    });

                    players.forEach(player => {
                        if(!player.leader) player.position.x += speed;
                    });
                }
            }
        }
        
        if(!player.leader){
            if(player.keys.jump && player.velocity.y == gravity){
                player.velocity.y -= jumpforce; // double jump mit counter <= 2 ig
            }
            if(player.keys.sprint){
                speed = width*(multi*2.24); //                                                             inc
            }else if(player.keys.sneak){
                speed = width*(multi*0.1);
            }else{
                speed = width*multi;
            }
            if(player.keys.right){
                player.velocity.x = speed;
            }else if(player.keys.left){
                player.velocity.x = speed *-1; //iohwrughseruighjpriughrhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
            }else player.velocity.x = 0;
        }
        

        // full platform collision (jump up from underneath)
        platforms.forEach(platform => {
            if(player.position.y + player.height <= platform.position.y 
                && player.position.y + player.height + player.velocity.y >= platform.position.y
                && player.position.x + player.width >= platform.position.x 
                && player.position.x <= platform.position.x + platform.width){
                player.velocity.y = 0;
            }
        });

        
        // full Item collision
        items.forEach(item => {
            if(player.position.y + player.height >= item.position.y
                && player.position.y<= item.position.y + item.height
                && player.position.x + player.width >= item.position.x
                && player.position.x<= item.position.x + item.width){
                    coinCollect.play();
                    if(difficulty == 'impossible') gameOver();
                    coins++;
                    if(difficulty == 'hard') coins++;
                    if(difficulty == 'easy') coins -= 0.5;
                    lvlcoins++;
                    if(difficulty != 'run') document.getElementById('coins').innerHTML = `<img class="coinDispImg" src="./img/coin.png" alt="">  ${coins}`;
                    item.width = 0;
                        item.position.x = -9999;
                    item.position.y = -9999;
            }
        });
        if(difficulty == 'impossible'){
            coins = Math.floor(distance/300);
            if(difficulty != 'run') document.getElementById('coins').innerHTML = `<img class="coinDispImg" src="./img/coin.png" alt="">  ${coins}`;
        } 
        if(player.position.y >= height*2){
            gameOver();
        }
        if(scrollOffset >= winx){
            victory();
        }
    });

    if(multiplayer == 'true'){
        let data = {
            "player": players[0].position,
            "offset": scrollOffset,
            "level": level,
            "width": width,
            "height": height
        };
        socket.emit('move', data);
    }
    
    printScores();
}
if(difficulty == 'run')document.getElementById('coins').innerHTML = ' ';
else document.getElementById('coins').innerHTML = `<img class="coinDispImg" src="./img/coin.png" alt="">  ${coins}`;

coin.onload = function() {
    coinload = true;
    console.log("coinloaded");
    imgLoaded();
};
if(difficulty != 'impossible')coin.src = "img/coin.png";
else coin.src = "img/skull.png";
checkpoint.onload = function() {
    checkpointload = true;
    console.log("checkpointloaded");
    imgLoaded();
};
checkpoint.src = "img/checkpoint.png";

function imgLoaded(){
    if(coinload && checkpointload){
        playMusic();
        levelSwitch();
        update();
        draw();
    }
}

// userMenu
function userMenu(){
    document.getElementById('blur').style.filter = "blur(10px)";
    document.getElementById('clearMenu').innerHTML = `
    <div id="menu">
        <div class="cross" onclick="closeMenu()">&#10006;</div>
        <div id="keybindbox" class="menu-box">
            <h2>Keybindings</h2>
            <div id="playerholder" ><select id="whatplayer" name="player"></select></div>
            <div id="keyinputholder">
            </div>
        </div>
        <div id="keymapHolder">
            " Keymappings: "
            <div id="keymap">
                "{ "<br>""down": 83, "<br>""jump": 32, "<br>""left": 65, "<br>""right": 68, "<br>""sneak": 17, "<br>""sprint": 16 }"
            </div>
        </div>
        <div class="menu-box">
            <h2>Customs</h2>
            <div class="customholder">
                <h3>Name: </h3>
                <input id="charface" type="text" maxlength="2" placeholder="Name">
            </div>
            <div class="customholder">
                <h3>RGB: </h3>
                <label class="switch">
                    <input id="RGB" type="checkbox" checked>
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="customholder">
                <h3>Player RGB: </h3>
                <label class="switch">
                    <input id="playerrgb" type="checkbox" checked>
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="customholder">
                <h3>Platform RGB: </h3>
                <label class="switch">
                    <input id="platrgb" type="checkbox" checked>
                    <span class="slider round"></span>
                </label>
            </div>
            <div class="customholder" id="playercolor">
                <h3>Player-Color: </h3>
                <input class="colorinput" type="color" id="Player-Color" name="player-color" value="#ff0000"><br><br>
            </div>
            <div class="customholder" id="platshadowcolor">
                <h3>Platform-Shadow: </h3>
                <input class="colorinput" type="color" id="Platform-Shadow" name="platform-shadow" value="#ff0000"><br><br>
            </div>
            <div class="customholder">
                <h3>Platform-Color: </h3>
                <input class="colorinput" type="color" id="Platform-Color" name="platform-color" value="#ff0000"><br><br>
            </div>
        </div>
        
    </div>`;
    /*for(let i = 0; i < players.length; i++){
        if(i != x)$('#playerholder').append(`<h3 onclick="remapKeys(${i})">Player ${i+1}</h3>`);
    }*/
    for(let i = 0; i < players.length; i++){
        $('#whatplayer').append(`<option value="${i}">Player ${i+1}</option>`);
    }
    console.log(playercolor);
    console.log(platshadow);
    console.log(platcolor);
    document.getElementById("Player-Color").value = ""+playercolor;
    document.getElementById("Platform-Shadow").value = ""+platshadow;
    document.getElementById("Platform-Color").value = ""+platcolor;
    
    colorInput();

    //$('#playerholder').append(``);
            
    //remapKeys(0);
    charface = document.getElementById('charface');
    charface.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            changeFace();
        }
    });

    //from CUSTOM SETTINGS
    if(playerrainbow && platrainbow) document.getElementById("RGB").checked = true;
    else document.getElementById("RGB").checked = false;
    $('#RGB').click(function () {
        if (this.checked) {
            playerrainbow = true;
            platrainbow = true;

        } else {
            playerrainbow = false;
            platrainbow = false;
        }
        if(playerrainbow) document.getElementById("playerrgb").checked = true;
        else document.getElementById("playerrgb").checked = false;

        if(platrainbow) document.getElementById("platrgb").checked = true;
        else document.getElementById("platrgb").checked = false;
        colorInput();
    });

    if(playerrainbow) document.getElementById("playerrgb").checked = true;
    else document.getElementById("playerrgb").checked = false;
    $('#playerrgb').click(function () {
        if (this.checked) {
            playerrainbow = true;
        } else {
            playerrainbow = false;
        } 
        colorInput();
    });

    if(platrainbow) document.getElementById("platrgb").checked = true;
    else document.getElementById("platrgb").checked = false;
    $('#platrgb').click(function () {
        if (this.checked) {
            platrainbow = true;
        } else {
            platrainbow = false;
        }
        colorInput();
    });

    $('#Player-Color').change(function () {
        playercolor = document.getElementById("Player-Color").value;
        console.log(playercolor);
    });

    $('#Platform-Color').change(function () {
        platcolor = document.getElementById("Platform-Color").value;
    });

    $('#Platform-Shadow').change(function () {
        platshadow = document.getElementById("Platform-Shadow").value;
    });

    remapKeys(document.getElementById('whatplayer').value);
    $("#whatplayer").change(function () {
        remapKeys(document.getElementById('whatplayer').value);
    });

    document.getElementById('clearMenu').style.opacity = 1;
    console.log("------menu opened------");
    menu = true;
}

function colorInput(){

    if(playerrainbow){
        $('#Player-Color').fadeTo( "slow", 0.33 );
        $( "#Player-Color" ).prop( "disabled", true );
        $( "#Player-Color" ).css('cursor', 'not-allowed');
    }else{
        $('#Player-Color').fadeTo( "slow", 1 );
        $( "#Player-Color" ).prop( "disabled", false );
        $( "#Player-Color" ).css('cursor', 'pointer');
    }
    if(platrainbow){
        $('#Platform-Shadow').fadeTo( "slow", 0.33 );
        $( "#Platform-Shadow" ).prop( "disabled", true );
        $( "#Platform-Shadow" ).css('cursor', 'not-allowed');
    }else{
        $('#Platform-Shadow').fadeTo( "slow", 1 );
        $( "#Platform-Shadow" ).prop( "disabled", false );
        $( "#Platform-Shadow" ).css('cursor', 'pointer');
    }
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    console.log((rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '');
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}
function componentToHex(c) {
    var hex = ctx.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function closeMenu(){
    changeFace();
    document.getElementById('blur').style.filter = "blur(0px)";
    document.getElementById('clearMenu').style.opacity = 0;
    setTimeout(clearMenu, "501")
    console.log("------menu closed------");
    saveSettings();
    
    //pressAnyButton();
    menu = false;
    update();
    draw();
}
function clearMenu() {
    document.getElementById('clearMenu').innerHTML = ``;
}
//userMenu();


// CUSTOMSTUFF

function saveGame(){
    localStorage.setItem("coins", coins);
    localStorage.setItem("level", level);
    localStorage.setItem("attempts", attempt);
}
function saveSettings(){
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("playercolor", playercolor);
    localStorage.setItem("platcolor", platcolor);
    localStorage.setItem("platshadow", platshadow);
    localStorage.setItem("playerrainbow", JSON.stringify(playerrainbow));
    localStorage.setItem("platrainbow", JSON.stringify(platrainbow));
    if(text) localStorage.setItem("charface", text);
}

function changeFace(){
    console.log(charface.value);
    if(charface.value && charface.value != '[object HTMLInputElement]') text = charface?.value;
}

function victory(){
    scrollOffset = 0;
    lvldistance = distance;
    level++;
    attempt = 1;
    //if(difficulty == 'impossible') coins += level*10+5;
    lvlcoins = 0;
    console.log(level);
    levelSwitch();
}

function gameOver(){
    if(difficulty == 'easy'){
        //dead = true;
        players.forEach(player => { 
            player.position.y = -200;
            player.position.x = startscrollL;//
            player.velocity.y = gravity*20;
        });
        allattempts++;
        attempt++;
    }
    if(difficulty == 'normal'){
        //dead = true;
        if(level == 2) backgroundmusic.currentTime = 10;
        else backgroundmusic.currentTime = 0;
        players.forEach(player => { 
            player.position.x = 100;
            player.position.y = 100;
            player.velocity.y = gravity;
        });
        scrollOffset = 0;
        distance = lvldistance;
        allattempts++;
        attempt++;
        coins -= lvlcoins;
        lvlcoins = 0;
    }
    if(difficulty == 'hard' || difficulty == 'run'){
        //dead = true;
        level = 0;
        backgroundmusic.currentTime = 0;
        players.forEach(player => { 
            player.position.x = 100;
            player.position.y = 100;
            player.velocity.y = gravity;
        });
        scrollOffset = 0;
        distance = 0;
        allattempts++;
        attempt++;
        coins = 0;
        lvlcoins = 0;
    }
    if(difficulty == 'impossible'){
        //dead = true;
        level = 0;
        backgroundmusic.currentTime = 0;
        players.forEach(player => { 
            player.position.x = 100;
            player.position.y = 100;
            player.velocity.y = gravity;
        });
        scrollOffset = 0;
        //distance = 0;
        allattempts++;
        attempt++;
        coins = 0;
        lvlcoins = 0;
    }
    if(difficulty != 'run') document.getElementById('coins').innerHTML = `<img class="coinDispImg" src="./img/coin.png" alt="">  ${coins}`;
    if(difficulty != 'easy') levelSwitch();
    //restart();
}

function restart(){
    location.reload();

    /*
   */
}

document.getElementById('fullscreen').addEventListener('click', fullScreen);
function fullScreen(){
    //document.body.requestFullscreen();
    console.log('eyman')
    if(document.body.requestFullscreen) {
        document.body.requestFullscreen();
      } else if(document.body.msRequestFullscreen) {      // for IE11 (remove June 15, 2022)
        document.body.msRequestFullscreen();
      } else if(document.body.webkitRequestFullscreen) {  // iOS Safari
        document.body.webkitRequestFullscreen();
      }
}

document.onkeydown = keyListenerDown;
document.onkeyup = keyListenerUp;

function keyListenerDown(e) {
    /*
    console.log(e);
    console.log(e.keyCode);
    */
   
    if(!menu){
        players.forEach(player => { 
            switch (e.keyCode){
                // up
                //case 38:        
                //case 87:     
                case player.reassign?.jump:
                    player.keys.jump = true;
                    break;
                // right
                //case 39:        
                case player.reassign?.right:        
                    player.keys.right = true;
                    break;
                // left
                //case 37:        
                case player.reassign?.left:
                    player.keys.left = true;
                    break;
                // down
                //case 40:        
                case player.reassign?.down:  
                    player.keys.down = true;      
                    player.velocity.y += 15;
                    break;
                // shift
                case player.reassign?.sprint:        
                    player.keys.sprint = true;
                    break;
                // sneak
                //case 20:
                case player.reassign?.sneak:
                    player.keys.sneak = true;
            }
        });
        switch(e.keyCode){
            case 27:
                userMenu();
        }
    }else{
        switch (e.keyCode){
            case 27:
                closeMenu();
        }
    }
    
}

function keyListenerUp(e) {
    players.forEach(player => { 
        switch (e.keyCode){
            case player.reassign?.sprint:        // shift
                player.keys.sprint = false;
                break;
            //case 37:        // left
            case player.reassign?.left:
                player.keys.left = false;
                break;
            //case 39:        // right
            case player.reassign?.right:        
                player.keys.right = false;
                break;
            //case 38:        // up
            //case 87:     
            case player.reassign?.jump: 
                player.keys.jump = false;  
                break;
            //case 40:        // down
            case player.reassign?.down:  
                    player.keys.down = false;     
                    break;
            // sneak
            //case 20:
            case player.reassign?.sneak:
                player.keys.sneak = false;
                break
        }
    });
}

// mobile keypresses....
function mobileJump(){
    players[0].keys.jump = true;
}
function mobileRight(){
    players[0].keys.right = true;
    players[0].keys.sprint = true;
}
function mobileLeft(){
    players[0].keys.left = true;
    players[0].keys.sprint = true;
}
function mobileStop(){
    players[0].keys.right = false;
    players[0].keys.left = false;
}
function stopJump(){
    players[0].keys.jump = false;
}


//reassign stuff
/*if(localStorage.getItem("players") != undefined) players = JSON.parse(localStorage.getItem("players"));
else{
    let asdfghjkl = 0;
    players.forEach(player =>{
        if(asdfghjkl > 1){
            player.reassign = {down: 40, jump: 38, left: 37, right: 39, sneak: 18, sprint: 13};
        }else{
            player.reassign = {down: 83, jump: 32, left: 65, right: 68, sneak: 17, sprint: 16};
        }
    })
}*/

function remapKeys(x){
    if(!mobile){   
        //remap keys https://codepen.io/jdoleary/pen/NqdmOM
        let keycodes = { // https://codepen.io/jdoleary/pen/NqdmOM
            8: "BCKSP", 13: "ENTER", 16: "SHIFT", 17: "ALTRIGHT", 18: "ALT", 27: "ESC", 32: "SPACE", 37: "LEFT", 38: "UP", 39: "RIGHT", 40: "DOWN", 46: "DEL", 91: "MAC", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause_break", 20: "caps_lock", 27: "escape", 33: "page_up", 34: "page down", 35: "end", 36: "home", 37: "left_arrow", 38: "up_arrow", 39: "right_arrow", 40: "down_arrow", 45: "insert", 46: "delete", 48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z", 91: "left_window key", 92: "right_window key", 93: "select_key", 96: "numpad 0", 97: "numpad 1", 98: "numpad 2", 99: "numpad 3", 100: "numpad 4", 101: "numpad 5", 102: "numpad 6", 103: "numpad 7", 104: "numpad 8", 105: "numpad 9", 106: "multiply", 107: "add", 109: "subtract", 110: "decimal point", 111: "divide", 112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "num_lock", 145: "scroll_lock", 186: "semi_colon", 187: "equal_sign", 188: "comma", 189: "dash", 190: "period", 191: "forward_slash", 192: "grave_accent", 219: "open_bracket", 220: "backslash", 221: "closebracket", 222: "single_quote"
        }

        let actions = players[x].reassign;/*{
            'jump': 32, 'left': 65, 'down': 83,  'right': 68, 'sprint': 16, 'sneak': 17
        };*/
        tempHtml = $("#whatplayer");
        /*
        tempHtml = `<select id="whatplayer" name="player">`;
        for(let i = 0; i < players.length; i++){
            tempHtml += `<option value="${i}">Player ${i+1}</option>`;
        }
        tempHtml += `</select>`;
*/
        $(document).ready(function() {
            $('#keybindbox').empty();
            $('#keybindbox').append(`<h2>Keybindings</h2>
                                    <div id="playerholder" ><select id="whatplayer" name="player"></select></div>
                                    <div id="keyinputholder" ></div>`);
            
            //create inputs:
            for (let a in actions) {
                $('#keyinputholder').append('<div class="keybox"><h3>' + a.charAt(0).toUpperCase() + a.substring(1, a.length) + ': ' + '</h3><input class="keyinput" name="' + a + '" value="' + keycodes[actions[a]] + '" type="text"/></div>');
                //set initial reassign values:
                players[x].reassign[a] = actions[a];
                //show values:
                $('#keymap').html(JSON.stringify(players[x].reassign, null, '<br/>'));
            }
            //set input handler for reassigning keys:
            $('.keyinput').keyup(function() {
                //show which key was pressed
                this.value = keycodes[event.keyCode];
                //set the new value in the reassign object
                players[x].reassign[this.name] = event.keyCode;
                //update the #keymap div to show the contents of reassign
                $('#keymap').html(JSON.stringify(players[x].reassign, null, '<br/>'));
                //unfocus input
                console.log('blur');
                $('input').blur();
            });

        /*for(let i = 0; i < players.length; i++){
            if(i != x)$('#playerholder').append(`<h3 onclick="remapKeys(${i})">Player ${i+1}</h3>`);
        }*/

        /*for(let i = 0; i < players.length; i++){
            $('#whatplayer').append(`<option value="${i}" >Player ${i+1}</option>`);
        }*/
            $('#whatplayer').replaceWith(tempHtml);
            $("#whatplayer").change(function () {
                //$('#keybindbox').empty();
                remapKeys(document.getElementById('whatplayer').value);
            });
        
        });
        if(players[x].reassign != actions){
            reassigned = true;
        }
    }
}
if(players.length > 1)players[1].reassign = {jump: 38, left: 37, right: 39, down: 40, sneak: 17, sprint: 13};

if(difficulty == 'run' && !buttonpressed) pressAnyButton();
function pressAnyButton(){
    $(document).ready(function () {
        $("body").append(`<h2 id="buttonpressed" >PRESS ANY BUTTON</h2>`);
        document.getElementById('blur').style.filter = "blur(10px)";
        menu = true;
        $("body").keypress(function () {
            menu = false;
            if(!buttonpressed) update();
            if(!buttonpressed) draw();
            $("#buttonpressed").empty();
            document.getElementById('buttonpressed').style.display = "none";
            document.getElementById('blur').style.filter = "blur(0px)";
            buttonpressed = true;
        });
    });
}
/*
$('#themetoggle').click(function () {
    if (this.checked) {
        darktheme = true;
    } else {
        darktheme = false;
    } 
    changeTheme();
});

function changeTheme(){
    if(darktheme){
        document.body.style.backgroundImage = "url('../img/galaxyNega.gif')";
        platrainbow = false;
        platshadow = '#000';
        platcolor = '#000';
    }
    else{
        document.body.style.backgroundImage = "url('../img/galaxyAll.gif')";
        platshadow = '#fff';
        platcolor = '#000';
    } 
    localStorage.setItem("darktheme", JSON.stringify(darktheme));
}
*/



window.addEventListener("gamepadconnected", function (e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
    gamepad = true;
    gamepadIndex = event.gamepad.index;
});

window.addEventListener("gamepaddisconnected", function (e) {
    console.log("Gamepad disconnected from index %d: %s",
        e.gamepad.index, e.gamepad.id);
    gamepad = false;
});


// NEW MEW

const camera = { x: 0, y: 0 };
const cameraSpeed = 0.1;

function updateCameraPosition() {
    players.forEach(player => {
        if(player.leader){
            camera.x += (player.position.x + player.width/2     - canvas.width/2.5    - camera.x) * cameraSpeed;
            camera.y += (player.position.y + player.height/2    - canvas.height/2   - camera.y) * cameraSpeed;
        }
    });
}




function moveProgressBar(percentage) {
    let elem = document.getElementById("myBar");   
    elem.style.width = percentage + '%';
    //document.getElementById("demo").innerHTML = Math.round(percentage)  + '%'; //<p id="demo">0%</p>
    //danke w3schools oba eicha progressbar is verbuggt meine is bessa ;D
}


function printScores(){
    let ratioWin = Math.round((winx/100+lvldistance/100) * (baseWidth/width));
    let ratiolvlDistance = Math.round((winx/100) * (baseWidth/width));
    let ratioDistance = Math.round(distance/100 * (baseWidth/width));
    /*document.getElementById('z').innerHTML = "Win: " + ratioWin;
    document.getElementById('a').innerHTML = "Distance: " + ratioDistance;
    */
    document.getElementById('a').innerHTML = "Score: " + ratioDistance;
    

    if(ratioDistance != 0){
        moveProgressBar(((distance-lvldistance)/(winx))*100);
    }
}