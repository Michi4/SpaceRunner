const indexWindow = window.open('', '_self', '');

function closeWindow(){
    indexWindow.close();
}

$.get(`/socket.io/socket.io.min.js`)
    .done(function () {

    }).fail(function () {
        $( ".noserver" ).remove();
    });
let charface;

function saveLocal(){
    
}

let difficulty = "normal"/*{
    easy: false,
    normal: false,
    hard: false,
    impossible: false
}*/
function pressedPlay(){
    genBtns(false);
}
function pressedCoop(){
    genBtns(true);
}

function pressedMultiplayer(){
    genBtns(true);
}

function genBtns(slider){
    document.getElementsByClassName('btnwrapper')[0].innerHTML = ``;
    if(slider){
        localStorage.setItem("multiplayer", true);
        document.getElementsByClassName('btnwrapper')[0].innerHTML = `
            <div class="block">
                <button style="color:white; font-size:1em">
                <h2 id="count">2 Players:</h2>
                <input type="range" name="players" id="playerslider" min="2" max="4" value="1" oninput="updateTextInput(this.value)">
                </button>
            </div>`;
    }else{
        localStorage.setItem("multiplayer", false);
    }
    document.getElementsByClassName('btnwrapper')[0].innerHTML += `
    <div class="block"><button class="playBtn" onclick="setDifficulty('easy')" style="color:green;">Easy</button></div>
    <div class="block" id="settings"><button onclick="setDifficulty('normal')" style="color:lightgrey;">Normal</button></div>
    <div class="block" id="settings"><button onclick="setDifficulty('hard')" style="color:red;"><p class="tiny-info">SCORE</p>Hard</button></div>
    <div class="block" id="settings"><button onclick="setDifficulty('impossible')" style="color:purple;"><p class="tiny-info">SCORE</p>Impossible</button></div>`;
}

function updateTextInput(value){
    document.getElementById('count').innerHTML = `${value} Players:`
}

function setDifficulty(a){
    let num = document.getElementById('playerslider')?.value;
    console.log(a);
    difficulty = a;
    //localStorage.setItem("id", id);
    localStorage.setItem("difficulty", difficulty);
    localStorage.setItem("playernum", '' + num ?? 1);
    window.location.assign('./game.html');
}


let mobile = false;
//  add mobile stuff
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    mobile = true;
    $( ".nomobile" ).remove();
}

let text = localStorage.getItem("charface") ?? ":)";//
let menu = false;

let reassign;
if(localStorage.getItem("reassign") != undefined){
    reassign = JSON.parse(localStorage.getItem("reassign"));
}else{
    reassign = {down: 83, jump: 32, left: 65, right: 68, sneak: 17, sprint: 16};
}
let reassigned = false;

//listenersis
function clickmenu(){
    if(!menu)userMenu()
    else closeMenu();
}

// userMenu
function userMenu(){
    document.getElementById('blur').style.filter = "blur(10px)";
    document.getElementById('clearMenu').innerHTML = `<div id="menu">
    <button onclick="remapKeys()">Controls</button>
    <input id="charface" type="text" maxlength="2" placeholder="charface">
    </div>`;
    charface = document.getElementById('charface');
    charface.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            changeFace();
        }
    });

    document.getElementById('clearMenu').style.opacity = 1;
    console.log("------menu opened------");
    menu = true;
}

function closeMenu(){
    document.getElementById('blur').style.filter = "blur(0px)";
    document.getElementById('clearMenu').style.opacity = 0;
    setTimeout(clearMenu, "501")
    console.log("------menu closed------");
    saveSettings()
    menu = false;
}
function clearMenu() {
    document.getElementById('clearMenu').innerHTML = ``;
}
//userMenu();


// CUSTOMSTUFF
function changeFace(){
    console.log(charface.value);
    if(charface.value && charface.value != '[object HTMLInputElement]') text = charface?.value;
}

document.onkeydown = keyListenerDown;
function keyListenerDown(e) {
    /*
    console.log(e);
    console.log(e.keyCode);
    */
    if(!menu){
        switch (e.keyCode){  
            case 27:
                //userMenu();
        }
    }else{
        switch (e.keyCode){
            case 27:
                closeMenu();
        }
    }
}

function remapKeys() {
    if (!mobile) {
        document.getElementById('clearMenu').innerHTML = `<div id="menu"><div class="nomobile">
                <div>Click on a key to reassign it.</div>
                <table>
                </table>
                <div id='keymapHolder'>
                    Keymappings:
                    <div id="keymap"></div>
                </div>
            </div></div>`;
        //remap keys https://codepen.io/jdoleary/pen/NqdmOM
        var keycodes = { // https://codepen.io/jdoleary/pen/NqdmOM
            8: "BCKSP", 13: "ENTER", 16: "SHIFT", 17: "ALTRIGHT", 18: "ALT", 27: "ESC", 32: "SPACE", 37: "LEFT", 38: "UP", 39: "RIGHT", 40: "DOWN", 46: "DEL", 91: "MAC", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause_break", 20: "caps_lock", 27: "escape", 33: "page_up", 34: "page down", 35: "end", 36: "home", 37: "left_arrow", 38: "up_arrow", 39: "right_arrow", 40: "down_arrow", 45: "insert", 46: "delete", 48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z", 91: "left_window key", 92: "right_window key", 93: "select_key", 96: "numpad 0", 97: "numpad 1", 98: "numpad 2", 99: "numpad 3", 100: "numpad 4", 101: "numpad 5", 102: "numpad 6", 103: "numpad 7", 104: "numpad 8", 105: "numpad 9", 106: "multiply", 107: "add", 109: "subtract", 110: "decimal point", 111: "divide", 112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "num_lock", 145: "scroll_lock", 186: "semi_colon", 187: "equal_sign", 188: "comma", 189: "dash", 190: "period", 191: "forward_slash", 192: "grave_accent", 219: "open_bracket", 220: "backslash", 221: "closebracket", 222: "single_quote"
        }


        var actions = {
            'jump': 32, 'left': 65, 'down': 83, 'right': 68, 'sprint': 16, 'sneak': 17
        };


        $(document).ready(function () {
            //create inputs:
            for (var a in actions) {
                $('table').append('<tr><td>' + a + '</td><td><input name="' + a + '" value="' + keycodes[actions[a]] + '" type="text"/></td></tr>');
                //set initial reassign values:
                reassign[a] = actions[a];
                //show values:
                $('#keymap').html(JSON.stringify(reassign, null, '<br/>'));
            }
            //set input handler for reassigning keys:
            $('input').keyup(function () {
                //show which key was pressed
                this.value = keycodes[event.keyCode];
                //set the new value in the reassign object
                reassign[this.name] = event.keyCode;
                //update the #keymap div to show the contents of reassign
                $('#keymap').html(JSON.stringify(reassign, null, '<br/>'));
                //unfocus input
                console.log('blur');
                $('input').blur();
            });
        });

        if (reassign != actions) {
            reassigned = true;
        }
    }
}

function saveSettings(){
    if(reassign) localStorage.setItem("reassign", JSON.stringify(reassign));
    if(text) localStorage.setItem("charface", text);
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

/*NEWNEW ig*/

function getLoggedUser() {
    let cookies = document.cookie.split(";");
    let userId = null;
    let username = "";
  
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
  
      if (cookie.indexOf("user_id=") === 0) {
        userId = cookie.substring("user_id=".length);
      }
  
      if (cookie.indexOf("username=") === 0) {
        username = cookie.substring("username=".length);
      }
    }
  
    console.log("User ID: " + userId + ", Username: " + username);
    document.getElementById("loggeduser").innerHTML = username;
  
    return userId;
  }
  
  getLoggedUser();