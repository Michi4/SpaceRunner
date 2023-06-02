//const defined once/onchange
const baseWidth = 1920;
const baseHeight = 1080;

let width = innerWidth;
let height = innerHeight;

let startScrollR = width*0.4;
let startScrollL = width*0.15;
const fps = 60;

const playerCount= parseInt(localStorage.getItem("playernum") ?? 1);

//gamepaddi

let gamepad = false;
let gamepadIndex;

// CANVAS
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
//SET width height (window.inner----)
canvas.width = width;
canvas.height = height;


//global changer
let playerrainbow = JSON.parse(localStorage.getItem("playerrainbow")) ?? true;
let platrainbow = JSON.parse(localStorage.getItem("platrainbow")) ?? false;


//Classes n Stuff
//OOP because OP for this

// needed for Player
let rgbCounter = 100;
let playerCounter = 1;
let rgbColor = "";
class Player{
    constructor(leader, color, shadow, text, reassigned){//if true rgb = on
        this.id = playerCounter++;
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
        //TODO maybe delete completely
        this.dead = false;
        
        this.width = width/38.4;
        this.height = width/38.4;

        this.text = text ?? "";
        this.color = color ?? true;
        this.shadow = shadow ?? true;
        this.reassigned = reassigned ?? false;
    }

    draw(){
        rgbCounter ++;
        if(this.color == true && rgbCounter >= 10){
            rgbCounter = 0;
            //playercolor = `${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}`;
            rgbColor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
            this.color = rgbColor;
            console.log(this.color);
        }
        ctx.shadowColor = `${this.color}`;
        ctx.fillStyle = `${this.color}`;
        ctx.shadowBlur = 180;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)

        ctx.shadowBlur = 0;
        ctx.font = `${width/55}px`;
        ctx.fillStyle = '#202124';
        ctx.fillText(this.text, this.position.x+this.width*0.1, this.position.y+this.height*0.7);
    }

    update(){
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if((this.position.y + this.height + this.velocity.y) <= canvas.height){
            this.velocity.y += game.gravity;
        }
    }
}

class Platform{
    constructor(x, y, width, height, color, shadow){//if true rgb = on
        this.position = {
            x,
            y
        };
        this.width = width ?? innerWidth*0.2;
        this.height = height ?? innerHeight*0.02;
        this.color = color ?? '#000000';
        this.shadow = shadow ?? '#ffffff';
    }

    draw(startx){
        if(platrainbow){
            this.shadow = rgbColor;
        }
        ctx.shadowColor = this.shadow;
        ctx.shadowBlur = 5;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x+(startx ?? 0), this.position.y, this.width, this.height);
    }
}

// TODO
//maybe better solution in future
let coinLoad = false;
const coin = new Image(); //onload zeile 437 :D
let musicLoad = false;

let checkpointLoad = false;
const checkpoint = new Image(); //onload zeile 652 :D


class Item{
    constructor(x, y, width, height, img, music){
        this.position = {
            x,
            y,
        };
        this.img = img ?? coin;
        this.width = width ?? innerWidth/48;
        this.height = height ?? innerWidth/48;
        this.music = music ?? new Audio('music/CoinCollect.mp3');
    }

    draw(startx){
        if(game.difficulty != 'impossible') ctx.shadowColor = 'gold';
        else ctx.shadowColor = '#000';
        ctx.shadowBlur = 80;
        //bad - coin TODO!
        ctx.drawImage(coin, this.position.x+(startx ?? 0), this.position.y, this.width, this.height);
    }
}

// needed for Level
let levelCount = 1;
class Level{
    constructor(platforms, items, winx){
        this.id = levelCount++;
        this.platforms = platforms ?? [];
        this.items= items ?? [];
        this.winx = winx ?? calcWinx(platforms);
    }

    resetPlatforms(){
        let temp = Infinity;
        this.platforms.forEach(platform => {
            if(platform.position.x < temp) temp = platform.position.x; 
        });
        this.platforms.forEach(platform => {
            platform.position.x -= temp; 
        });
    }

    firstPlatform(){
        let temp = Infinity;
        let plat;
        this.platforms.forEach(platform => {
            if(platform.position.x < temp){
                temp = platform.position.x;
                plat = platform;
            }  
        });
        return plat;
    }

    draw(startx){
        this.platforms.forEach(platform => {
            platform.draw(startx);
        });
        this.items.forEach(item => {
            item.draw(startx);
        });
    }
}
// TODO
/*
if(speedMode){
    game.multiplier = 0.006875;//0.006875

    game.gravity = 4.5;//4.5
    speed = 0.275;//0.275
    jumpforce = 55;//55
}*/
class Game{
    constructor(levels, difficulty, multiplayer, speedMode){
        this.levels = levels ?? [];
        this.difficulty = difficulty ?? 'normal';
        this.multiplayer = multiplayer ?? false;
        this.speedMode = speedMode ?? false;
        this.buttonpressed = false;

        this.level = 0;
        this.lvlSwitcher = 0;
        this.attempts = 1; //attempts now = allattempts no more level attempts

        //distance
        this.scrollOffset = 0;
        this.distance = 0;
        this.lvlDistance = 0;
        
        //coins
        this.coins = 0;
        this.lvlCoins = 0;

        this.multiplier = 0.0025*2;//0.0025
        this.gravity = height / 1700*5;
        this.speed = width*this.multiplier;
        this.jumpforce = height*(this.multiplier-0.0005)*10;
    }

    getCurrentLevel(){
        return this.levels[this.lvlSwitcher];
    }

    addLevel(level){
        this.levels.push(level);
    }

    draw(){
        players.forEach(player => {
            player.draw();
        });
        //TODOOO
        this.levels[this.lvlSwitcher].draw();//TODOOO
        ///*
        if(this.levels[this.lvlSwitcher-1]){
            let startx = 0;
            if(this.levels[this.lvlSwitcher-2]) startx = this.levels[this.lvlSwitcher-2].winx;
            this.levels[this.lvlSwitcher-1].platforms.forEach(platform =>{
                platform += startx;
            });
            this.levels[this.lvlSwitcher-1].items.forEach(item =>{
                item += startx;
            });
            this.levels[this.lvlSwitcher-1].draw(startx);
        }
        if(this.levels[this.lvlSwitcher+1]){
            let startx = this.levels[this.lvlSwitcher].winx-width/2;
            this.levels[this.lvlSwitcher+1].platforms.forEach(platform =>{
                platform += startx;
            });
            this.levels[this.lvlSwitcher+1].items.forEach(item =>{
                item += startx;
            });
            this.levels[this.lvlSwitcher+1].draw(startx);
        }
        //*/
    }
}



// Game Objects
//creating players for playerCount
let players = [new Player(true)];
for(let i = 1; i < playerCount; i++){
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
// plus preload with levels
let game = new Game([level0(), level1(), level2(), level3()], localStorage.getItem("difficulty") ?? 'normal', false, localStorage.getItem("speedMode") ?? false);
// for later:
game.addLevel(randomGen());

//listenersis
let menu = false;
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
}


//LEVELS

function calcWinx(objArr){
    if(!objArr) return -1;
    let calcw = 0;
    objArr.forEach(obj => {
            if(obj.position.x+obj.width > calcw) calcw = obj.position.x+obj.width; 
    });
    return calcw;
}

function level0(){
    //winx = width*1.5;
    let lvlplatforms = [
        new Platform(0, height*0.8, width*2, height*0.2),
        
        new Platform(width*0.05, height*0.4, width*0.05),
        new Platform(width*0.15, height*0.5, width*0.05),
        new Platform(width*0.25, height*0.6, width*0.05),
        new Platform(width*0.35, height*0.7, width*0.05),

        new Platform(width*0.7, height*0.6, width*0.2),
        new Platform(width*1.2, height*0.6, width*0.2),
        //new Platform(width*1.7, height*0.6, width*0.2)
    ];

    //TODO - TUTORIAL maybe not using this but example --> use REASSIGN!!!!!!!
    //addText(width*1.7, height*0.6);
    /*alltext = [
        new Text(`${reassign.sprint} to Sprint`, width*0.6, height*0.5),

    ];*/

    let lvlitems = [
        new Item(width*0.165, height*0.4, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.265, height*0.5, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.365, height*0.6, coin, innerWidth/48, innerWidth/48)
    ];

    return new Level(lvlplatforms, lvlitems);
}
function level1(){
    //winx = width*3;
    let lvlplatforms = [
        new Platform(0, height*0.8, width*0.5, height*0.2),//, '#000000', '#00000000'),
        new Platform(width, height*0.8, width*0.5, height*0.2),
        new Platform(width*2, height*0.8, width*0.5, height*0.2),
        new Platform(width*3, height*0.8, width*0.5, height*0.2),

        new Platform(width*0.6, height*0.75, width*0.3),
        new Platform(width*1.6, height*0.75, width*0.3),
        new Platform(width*2.6, height*0.75, width*0.3),
    ];

    let lvlitems = [
        new Item(width*0.95, height*0.45, coin, innerWidth/48, innerWidth/48),

        new Item(width*1.25, height*0.74, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.95, height*0.45, coin, innerWidth/48, innerWidth/48),

        new Item(width*2.25, height*0.74, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.95, height*0.45, coin, innerWidth/48, innerWidth/48),
    ];
    
    return new Level(lvlplatforms, lvlitems);
}
// hi C:D
function level2(){
    //winx = width*3;
    let lvlplatforms = [
        new Platform(0, height*0.8, width*0.5 , height*0.2),
        new Platform(width, height*0.8, width*0.5, height*0.2),     // base platform - do over 15 when not let thru IS FALSCH IWIE klar is des falsch retard
        new Platform(width*2, height*0.8, width*0.5, height*0.2),
        new Platform(width*3, height*0.8, width*0.5, height*0.2),
        
        new Platform(width*0.6, height*0.45, width*0.3),
        new Platform(width*0.6, height*0.75, width*0.3),
        new Platform(width*1.6, height*0.75, width*0.3),
        new Platform(width*2.6, height*0.75, width*0.3)
    ];

    let lvlitems = [
        new Item(width*0.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.95, height*0.45, coin, innerWidth/48, innerWidth/48),

        new Item(width*1.25, height*0.74, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.95, height*0.45, coin, innerWidth/48, innerWidth/48),

        new Item(width*2.25, height*0.74, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.51, height*0.45, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.95, height*0.45, coin, innerWidth/48, innerWidth/48),
    ];
    
    return new Level(lvlplatforms, lvlitems);
}

function level3(){
    //winx = width*3.5;
    let lvlplatforms = [
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

    let lvlitems = [
        new Item(width*0.69, height*0.6, coin, innerWidth/48, innerWidth/48),
        new Item(width*0.94, height*0.4, coin, innerWidth/48, innerWidth/48),
        
        new Item(width*1.05, height*0.25, coin, innerWidth/48, innerWidth/48),
        new Item(width*1.4, height*0.3, coin, innerWidth/48, innerWidth/48),

        new Item(width*1.79, height*0.64, coin, innerWidth/48, innerWidth/48),        
        new Item(width*2.1, height*0.5, coin, innerWidth/48, innerWidth/48),
        new Item(width*2.4, height*0.74, coin, innerWidth/48, innerWidth/48),
    ];
    
    return new Level(lvlplatforms, lvlitems);
}

function randomGen(){
    let lvlplatforms = [];
    let lvlitems = [];
    //lvlitems.length = 0;
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
    lvlplatforms[0] = new Platform(0, height*0.8, width*0.5, height*0.2);
    //if(game.level <= 4) lvlplatforms[0] = new Platform(0, height*0.8, width*0.5, height*0.2, '#00000000', '#00000000');
    //else lvlplatforms[0] = new Platform(0, height*0.8, width*0.5, height*0.2);
    for(let i = 1; i < 9; i++){
        platpos.x = Math.random() * ((platpos.x  + platdim.x)+ 0.28 - (platpos.x  + platdim.x)) + (platpos.x  + platdim.x);
        platpos.y = Math.random() * (0.99 - (platpos.y-0.25)) + (platpos.y-0.25);

        platdim.x = Math.random() * (1 - 0.2) + 0.2;
        platdim.y = Math.random() * (1 - 0.015) + 0.015;

        lvlplatforms[i] = new Platform(width * platpos.x, height * platpos.y, width*platdim.x, height*platdim.y);

        //COINS man
        if(game.difficulty != 'run'){
            for(let j = 0; j < Math.floor(Math.random()*5); j++){
                coinpos.x = Math.random() * (lvlplatforms[i].width+lvlplatforms[i].position.x - lvlplatforms[i].position.x) + lvlplatforms[i].position.x;
                coinpos.y = Math.random() * (lvlplatforms[i].position.y-0.06*height - (lvlplatforms[i].position.y-0.3*height)) +  (lvlplatforms[i].position.y-0.3*height);
                lvlitems[i+j] = new Item(coinpos.x, coinpos.y, coin, innerWidth/48, innerWidth/48);
            }
        }
    }
    lvlplatforms[9] = new Platform(lvlplatforms[8].position.x+lvlplatforms[8].width + (Math.random()*0.3), height*0.8, width*0.5, height*0.2);

    //winx = lvlplatforms[9].position.x;
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

    lvlplatforms[0] = new Platform(0, height*0.8, width*0.5, height*0.2);
    for(let i = 1; i < 9; i++){
        platpos.x = Math.random() * ((platpos.x  + platdim.x)+0.28 - (platpos.x  + platdim.x)) + (platpos.x  + platdim.x);
        platpos.y = Math.random() * (0.99 - (platpos.y-0.25)) + (platpos.y-0.25);

        platdim.x = Math.random() * (0.3 - 0.1) + 0.1;
        platdim.y = Math.random() * (0.025 - 0.015) + 0.015; 
        lvlplatforms[i] = new Platform(width * platpos.x, height * platpos.y, width*platdim.x, height*platdim.y);

        //COINS man
        if(game.difficulty != 'run' && Math.random() > 0.5){
            coinpos.x = Math.random() * (lvlplatforms[i].width+lvlplatforms[i].position.x - lvlplatforms[i].position.x) + lvlplatforms[i].position.x;
            coinpos.y = Math.random() * (lvlplatforms[i].position.y-0.06*height - (lvlplatforms[i].position.y-0.3*height)) +  (lvlplatforms[i].position.y-0.3*height);
            lvlitems[i] = new Item(coinpos.x, coinpos.y, coin, innerWidth/48, innerWidth/48);
        } 
    }
    lvlplatforms[9] = new Platform(lvlplatforms[8].position.x+lvlplatforms[8].width + (Math.random()*0.3), height*0.8, width*0.5, height*0.2);

    //winx = lvlplatforms[9].position.x;
    }

    return new Level(lvlplatforms, lvlitems);
}

//TODO NOW
function levelSwitch(){
    return;
    //randomGen();
    if(game.difficulty == "run"){
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

//TODO
//maybe doch class? WIRKLICH NICHT SICHER is aber dann eh nur für tutorial
function addText(text, x, y){
    ctx.shadowBlur = 0;
    ctx.fillStyle = platcolor;
    ctx.font = `${width/55}px Cascadia Code`;
    ctx.fillStyle = '#fff';
    ctx.fillText(text, x, y);
}

function draw(){
    if (!players.every(player => {
        return player.dead;
    }) && !menu && coinLoad) requestAnimationFrame(draw);
        
    if(innerWidth != width /*&& !game.multiplayer*/){
        width = innerWidth;
        console.log('width: ' + width)
        startScrollR = width*0.4;
        startScrollL = width*0.15;
        canvas.width = width;
        //winx = width*3;
        speed = width*game.multiplier;
        levelSwitch();
    }                                                           //mach änderererer
    if(innerHeight!= height /*&& !game.multiplayer*/){
        console.log('height: ' + height)
        height = innerHeight;
        canvas.height = height;
        game.jumpforce = height*(game.multiplier-0.0005)*10;
        levelSwitch();
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
/*

    players.forEach(player => {
        player.draw();
    });
    
    platforms.forEach(platform => {
        platform.draw();
    });
    
    items.forEach(item => {
        item.draw();
    });
*/
    game.draw();

    ctx.restore();
}
let clickcount = 0;
function update(){
    if (!players.every(player => {
        return player.dead;
    })&& !menu && coinLoad) setTimeout(update, 1000/fps);

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

    players.forEach(player => {
        if(game.difficulty == 'run') player.keys.left = false;
        if(game.difficulty == 'run') player.keys.right = true;
        player.update();
    });
    players.forEach(player => {
        //border
        if(player.position.x <= game.getCurrentLevel().firstPlatform().position.x){
            player.position.x = game.getCurrentLevel().firstPlatform().position.x;
            player.keys.left = false;
        }
        if(player.leader){
            if(player.keys.jump && player.velocity.y == game.gravity){
                player.velocity.y -= game.jumpforce; // double jump mit counter <= 2 ig
            }
            if(player.keys.sprint){
                speed = width*(game.multiplier*2.24); //                                                             inc
            }else if(player.keys.sneak){
                speed = width*(game.multiplier*0.1);
            }else{
                speed = width*game.multiplier;
            }
            if(player.keys.right && player.position.x < startScrollR){
                player.velocity.x = speed;
            }else if(player.keys.left && player.position.x > startScrollL){
                player.velocity.x = speed *-1;
            }else if(player.leader){
                player.velocity.x = 0;
                if(player.keys.right){
                    //console.log(speed)
                    game.scrollOffset += speed;
                    game.distance += speed;

                    game.getCurrentLevel().platforms.forEach(platform => {
                        platform.position.x -= speed;
                    });
                    
                    // fake previous plat
                    if(game.levels[game.lvlSwitcher-1]){
                        game.levels[game.lvlSwitcher-1].platforms.forEach(platform => {
                            platform.position.x -= speed;
                        });
                    }

                    // fake next plat
                    if(game.levels[game.lvlSwitcher+1]){
                        game.levels[game.lvlSwitcher+1].platforms.forEach(platform => {
                            platform.position.x -= speed;
                        });
                    }
                   

                    game.getCurrentLevel().items.forEach(item => {
                        item.position.x -= speed;
                    });

                    players.forEach(player => {
                        if(!player.leader) player.position.x -= speed;
                    });
                }else if(player.keys.left){
                    game.scrollOffset -= speed;
                    game.distance -= speed;
                    game.getCurrentLevel().platforms.forEach(platform => {
                        platform.position.x += speed;
                    });

                    // fake previous plat
                    if(game.levels[game.lvlSwitcher-1]){
                        game.levels[game.lvlSwitcher-1].platforms.forEach(platform => {
                            platform.position.x += speed;
                        });
                    }
                    // fake next plat
                    if(game.levels[game.lvlSwitcher+1]){
                        game.levels[game.lvlSwitcher+1].platforms.forEach(platform => {
                            platform.position.x += speed;
                        });
                    }
                    
                    game.getCurrentLevel().items.forEach(item => {
                        item.position.x += speed;
                    });

                    players.forEach(player => {
                        if(!player.leader) player.position.x += speed;
                    });
                }
            }
        }
        
        if(!player.leader){
            if(player.keys.jump && player.velocity.y == game.gravity){
                player.velocity.y -= game.jumpforce; // double jump mit counter <= 2 ig
            }
            if(player.keys.sprint){
                speed = width*(game.multiplier*2.24); //                                                             inc
            }else if(player.keys.sneak){
                speed = width*(game.multiplier*0.1);
            }else{
                speed = width*game.multiplier;
            }
            if(player.keys.right){
                player.velocity.x = speed;
            }else if(player.keys.left){
                player.velocity.x = speed *-1; //iohwrughseruighjpriughrhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
            }else player.velocity.x = 0;
        }
        // full platform collision (jump up from underneath)
        game.getCurrentLevel().platforms.forEach(platform => {
            if(player.position.y + player.height <= platform.position.y 
                && player.position.y + player.height + player.velocity.y >= platform.position.y
                && player.position.x + player.width >= platform.position.x 
                && player.position.x <= platform.position.x + platform.width){
                player.velocity.y = 0;
            }
        });

        // full Item collision
        game.getCurrentLevel().items.forEach(item => {
            if(player.position.y + player.height >= item.position.y
                && player.position.y<= item.position.y + item.height
                && player.position.x + player.width >= item.position.x
                && player.position.x<= item.position.x + item.width){
                    if(item.music){
                        item.music.play();
                    }
                    //coinCollect.play();
                    if(game.difficulty == 'impossible') gameOver();
                    coins++;
                    if(game.difficulty == 'hard') coins++;
                    if(game.difficulty == 'easy') coins -= 0.5;
                    game.lvlcoins++;
                    if(game.difficulty != 'run') document.getElementById('coins').innerHTML = `<img class="coinDispImg" src="./img/coin.png" alt="">  ${coins}`;
                    item.width = 0;
                    item.position.x = -9999;
                    item.position.y = -9999;
            }
        });
        if(game.difficulty == 'impossible'){
            coins = Math.floor(game.distance/300);
            if(game.difficulty != 'run') document.getElementById('coins').innerHTML = `<img class="coinDispImg" src="./img/coin.png" alt="">  ${coins}`;
        } 
        if(player.position.y >= height*2){
            gameOver();
        }
        if(game.scrollOffset >= game.getCurrentLevel().winx -width/2){//- width){
            victory();
        }
    });

    if(game.multiplayer == 'true'){
        let data = {
            "player": players[0].position,
            "offset": game.scrollOffset,
            "level": level,
            "width": width,
            "height": height
        };
        socket.emit('move', data);
    }
    printScores();
}
if(game.difficulty == 'run')document.getElementById('coins').innerHTML = ' ';
else document.getElementById('coins').innerHTML = `<img class="coinDispImg" src="./img/coin.png" alt="">  ${coins}`;

//TODO
if(game.difficulty != 'impossible')coin.src = "img/coin.png";
else coin.src = "img/skull.png";
coin.onload = function() {
    coinLoad = true;
    console.log("coinloaded");
    imgLoaded();
};/*
checkpoint.onload = function() {
    checkpointLoad = true;
    console.log("checkpointloaded");
    imgLoaded();
};
checkpoint.src = "img/checkpoint.png";
*/
//TODO
/*if(game.levels.every(level => {
    return level.items.every(item => {
        return item.music.canplaythrough === true;
    });
})){
    musicLoad = true;
    imgLoaded();
}*/

//TODO
function imgLoaded(){
    if(coinLoad /*&& checkpointLoad*/ /*&& musicLoad*/){
        //playMusic();
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

// CUSTOMSTUFF
function saveGame(){
    localStorage.setItem("coins", game.coins);
    localStorage.setItem("level", game.lvlSwitcher);
    localStorage.setItem("attempts", game.attempts);
}
function saveSettings(){
    localStorage.setItem("players", JSON.stringify(players));
    localStorage.setItem("playercolor", playercolor);
    localStorage.setItem("platcolor", platcolor);
    localStorage.setItem("platshadow", platshadow);
    localStorage.setItem("playerrainbow", JSON.stringify(playerrainbow));
    localStorage.setItem("platrainbow", JSON.stringify(platrainbow));
    players.forEach(player => { 
        localStorage.setItem("charface"+player.id, player.text);
    });
}

function changeFace(){
    console.log(charface.value);
    if(charface.value && charface.value != '[object HTMLInputElement]') text = charface?.value;
}

function victory(){
    game.lvlSwitcher++;
    if(game.lvlSwitcher == 2){
        game.addLevel(randomGen());
        game.levels.shift();
        console.log(game.levels);

        game.lvlSwitcher = 1;
    }
    game.getCurrentLevel().resetPlatforms();

    game.scrollOffset = 0;
    game.lvldistance = game.distance;
    //game.attempts = 1;
    //if(game.difficulty == 'impossible') coins += level*10+5;
    game.lvlcoins = 0;
    console.log(game.lvlSwitcher);
    levelSwitch();
}

function gameOver(){
    //TODO
    
    if(game.difficulty == 'easy'){
        //dead = true;
        players.forEach(player => { 
            player.position.y = -200;
            player.position.x = startScrollL;//
            player.velocity.y = game.gravity*20;
        });
        //allattempts++;
        game.attempts++;
    }
    if(game.difficulty == 'normal'){
        //dead = true;
        //if(level == 2) backgroundmusic.currentTime = 10;
        //else backgroundmusic.currentTime = 0;
        players.forEach(player => { 
            player.position.x = 100;
            player.position.y = 100;
            player.velocity.y = game.gravity;
        });
        game.scrollOffset = 0;
        game.distance = game.lvldistance;
        //allattempts++;
        game.attempts++;
        game.coins -= game.lvlcoins;
        game.lvlcoins = 0;
        game.levels.forEach(level =>{
            level.resetPlatforms();
        });
        game.lvlSwitcher = 0;
        game.levels.shift();
    }
    if(game.difficulty == 'hard' || game.difficulty == 'run'){
        //dead = true;
        game.level = 0;
        game.lvlSwitcher = 0;
        //backgroundmusic.currentTime = 0;
        players.forEach(player => { 
            player.position.x = 100;
            player.position.y = 100;
            player.velocity.y = game.gravity;
        });
        game.scrollOffset = 0;
        game.distance = 0;
        //allattempts++;
        game.attempts++;
        game.coins = 0;
        game.lvlcoins = 0;
        game.levels.forEach(level =>{
            level.resetPlatforms();
        });
        game.levels = [level0(), level1(), level2(), level3()];
        game.addLevel(randomGen());
    }
    if(game.difficulty == 'impossible'){
        //dead = true;
        game.level = 0;
        game.lvlSwitcher = 0;
        //backgroundmusic.currentTime = 0;
        players.forEach(player => { 
            player.position.x = 100;
            player.position.y = 100;
            player.velocity.y = game.gravity;
        });
        game.scrollOffset = 0;
        game.distance = 0;
        //allattempts++;
        game.attempts++;
        game.coins = 0;
        game.lvlcoins = 0;
        game.levels = [level0(), level1(), level2(), level3()];
        game.addLevel(randomGen());
    }
    if(game.difficulty != 'run') document.getElementById('coins').innerHTML = `<img class="coinDispImg" src="./img/coin.png" alt="">  ${coins}`;
    if(game.difficulty != 'easy') levelSwitch();
    
    document.getElementById('attemptcount').innerHTML = `Attempt: ${game.attempts}`;
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
function remapKeys(x){
    if(!mobile){   
        //remap keys https://codepen.io/jdoleary/pen/NqdmOM
        let keycodes = { // https://codepen.io/jdoleary/pen/NqdmOM
            8: "BCKSP", 13: "ENTER", 16: "SHIFT", 17: "ALTRIGHT", 18: "ALT", 27: "ESC", 32: "SPACE", 37: "LEFT", 38: "UP", 39: "RIGHT", 40: "DOWN", 46: "DEL", 91: "MAC", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause_break", 20: "caps_lock", 27: "escape", 33: "page_up", 34: "page down", 35: "end", 36: "home", 37: "left_arrow", 38: "up_arrow", 39: "right_arrow", 40: "down_arrow", 45: "insert", 46: "delete", 48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z", 91: "left_window key", 92: "right_window key", 93: "select_key", 96: "numpad 0", 97: "numpad 1", 98: "numpad 2", 99: "numpad 3", 100: "numpad 4", 101: "numpad 5", 102: "numpad 6", 103: "numpad 7", 104: "numpad 8", 105: "numpad 9", 106: "multiply", 107: "add", 109: "subtract", 110: "decimal point", 111: "divide", 112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "num_lock", 145: "scroll_lock", 186: "semi_colon", 187: "equal_sign", 188: "comma", 189: "dash", 190: "period", 191: "forward_slash", 192: "grave_accent", 219: "open_bracket", 220: "backslash", 221: "closebracket", 222: "single_quote"
        }

        let actions = players[x].reassign;
        tempHtml = $("#whatplayer");
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

if(game.difficulty == 'run' && !buttonpressed) pressAnyButton();
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
let cameraSpeed = 0.1;

function updateCameraPosition() {
    players.forEach(player => {
        if(player.leader){
            camera.x += (player.position.x + player.width/2     - canvas.width/2.5    - camera.x) * cameraSpeed;
            if(camera.y <= height*0.25){
                cameraSpeed = 0.1;
                camera.y += (player.position.y + player.height/2    - canvas.height/1.8   - camera.y) * cameraSpeed;
            }else{
                cameraSpeed *= 0.99;
                if(cameraSpeed <= 0.01){
                    cameraSpeed = 0.1;    
                }
                camera.y += (player.position.y + player.height/2    - canvas.height/1.8   - camera.y) * cameraSpeed*0.5;
            }
            
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
    let ratioWin = Math.round((game.getCurrentLevel().winx/100+game.lvldistance/100) * (baseWidth/width));
    let ratiolvlDistance = Math.round((game.getCurrentLevel().winx/100) * (baseWidth/width));
    let ratioDistance = Math.round(game.distance/100 * (baseWidth/width));
    /*document.getElementById('z').innerHTML = "Win: " + ratioWin;
    document.getElementById('a').innerHTML = "Distance: " + ratioDistance;
    */
    document.getElementById('a').innerHTML = "  " + ratioDistance;
    
    if(ratioDistance != 0){
        moveProgressBar(((game.distance-game.lvldistance)/(game.getCurrentLevel().winx))*100);
    }
}

function getLoggedUser() {
    // Split the cookie string into an array of name-value pairs
    let cookies = document.cookie.split(";");

    // Loop through the cookies to find the user_id cookie
    let userId = null;
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf("user_id=") == 0) {
        // Extract the user_id value from the cookie
        userId = cookie.substring("user_id=".length, cookie.length);
        break;
      }
    }

    // Return the userId variable
    console.log(userId);
    console.log("userId");
    console.log("userId");
    return userId;
}
getLoggedUser();