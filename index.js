// var app = require('express')();
// var http = require('http').createServer(app);
//
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });
//
// http.listen(3000, () => {
//     console.log('listening on *:3000');
// });

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var userArray = ["apple"];   //.
var userPassword = ["apple"];
var currentlogin = []; //.
var usercolor = ["#85FFBD"];
var chathistory = [];  //.
var currentUser = -1;   //.
var currentUsername;    //.
var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');

});

app.get('/42', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    var passw = userPassword[getusernameIndex(currentUsername)];
    res.cookie(currentUsername,passw);
});

app.get('/43', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
});

app.get('/44', (req, res) => {
    res.sendFile(__dirname + '/emoji1.jpg');
});

app.get('/45', (req, res) => {
    res.sendFile(__dirname + '/emoji2.jpg');
});

app.get('/46', (req, res) => {
    res.sendFile(__dirname + '//emoji3.jpg');
});



http.listen(9999, () => {
    console.log('listening on *:9999');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        //console.log('message: ' + msg);
    });
});

io.on('connection', (socket) => {
    socket.on('changecurrent', (msg) => {
        //console.log("change user" + msg);
        currentUsername = msg;
        currentUser = getcurrentnameIndex(msg);
    });
});

// io.on('connection', (socket) => {
//     socket.broadcast.emit('hi');
// });

// 当接收到chat message请求后， 返回信息更新到网页
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        //console.log(msg);
        var orderN = msg.slice(0,5);
        var orderC = msg.slice(0,6);
        var orderStatus = 0;
        if(orderN == "/name"){
            orderStatus = 1;
            var newname = msg.slice(7,-1);
            var usernameIsValidx = usernameIsValid(newname);
            var nameexit = checkexistingUsername(newname);
            if (nameexit == false){
                socket.emit('failcname1');
            }else{
                if(usernameIsValidx){
                    // console.log("currt" + currentlogin);
                    changeUsername(newname);
                    // console.log("currt" + currentlogin);
                    socket.emit('updateheader',newname);
                    io.emit('updatesider',currentlogin, currentUser);
                    io.emit('updatechatlog',chathistory, currentUsername);
                    socket.emit('updatechatlog1');
                }else {
                    socket.emit('failcname2');
                }
            }

        }

        if(orderC == "/color"){
            orderStatus = 1;
            var newcolor = "#" + msg.slice(8,-1);
            if(testColor(newcolor)){
                var index = getusernameIndex(currentUsername);
                usercolor[index] = newcolor;
                renewHistory(newcolor);
                io.emit('updatechatlog',chathistory, currentUsername);
                socket.emit('updatechatlog1');
            }else {
                socket.emit('failccolor');
            }
        }

        if(orderStatus == 0 && (currentUsername != null)) {
            //console.log("I recieved login post");
            var tempchat = [];
            var date = new Date();
            var month = date.getMonth() + 1;
            var mss = msg;
            var daMsg = date.getFullYear().toString() +
                "/" + month + "/" + date.getUTCDate().toString() +
                "    " + date.getHours().toString() +
                ":" + date.getMinutes().toString() +
                ":" + date.getSeconds().toString();
            tempchat.push(currentUsername);
            tempchat.push(daMsg);
            tempchat.push(msg);
            var usercolorx = usercolor[getusernameIndex(currentUsername)];
            tempchat.push(usercolorx);
            if (chathistory.length < 200) {
                chathistory.push(tempchat);
            } else {
                chathistory.shift();
                chathistory.push(tempchat);
            }
            //console.log(chathistory);

            //console.log(usercolorx);
            io.emit('chat message', daMsg, mss, currentUsername, usercolorx);
        }
    });
});

io.on('connection', (socket) => {
    socket.on('LogIN', (username, password) => {
        var i = getusernameIndex(username);
        if(i === -1){
            socket.emit('donuser',username);
        }
        if(i > -1) {
            if(userPassword[i] === password) {
                socket.emit('LogIN', username);
                currentUsername = username;
                if(checkexistingcurrentname(username)){
                    currentlogin.push(username);
                }
                currentUser = getcurrentnameIndex(username);
                io.emit('updatesider',currentlogin,currentUser);
            }else {
                socket.emit('wrongpassword', username);
            }
        }
    });
});

function usernameIsValid(username100) {
    // console.log("i am good" + username100);
    var validcharacters = '1234567890-_.abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if(username100.length < 4){
        return false;
    }
    for (var i = 0, l = username100.length; i < l; ++i) {
        if (validcharacters.indexOf(username100.substr(i, 1)) == -1) {
            return false;
        }
        return true;
    }
}

function checkexistingUsername(username){
    for (let i = 0; i < userArray.length; i++) {
        if (userArray[i] == username){
            return false;
        }
    }
    return true;
}


function checkexistingcurrentname(username){
    for (let i = 0; i < userArray.length; i++) {
        if (currentlogin[i] == username){
            return false;
        }
    }
    return true;
}

function  getusernameIndex(username){
    for (let i = 0; i < userArray.length; i++) {
        if (userArray[i] == username){
            return i;
        }
    }
    return -1;
}

function  getcurrentnameIndex(username){
    for (let i = 0; i < userArray.length; i++) {
        if (currentlogin[i] == username){
            return i;
        }
    }
    return -1;
}

function  changeUsername(newusername){
    var tempname = currentUsername;
    for (let i = 0; i < userArray.length; i++) {
        if (userArray[i] == currentUsername){
            userArray[i] = newusername;
            currentUsername = newusername;
            console.log(currentUsername);
            currentUser = getcurrentnameIndex(tempname);
            console.log(currentUser);
            currentlogin[currentUser] = newusername;
            console.log(currentlogin);
        }
    }
    for (let i = 0; i < chathistory.length; i++) {
        if(chathistory[i][0] == tempname){
            chathistory[i][0] = newusername;
        }
    }
    return -1;
}

function renewHistory(newcolor){
    for (let i = 0; i < chathistory.length; i++) {
        if(chathistory[i][0] == currentUsername){
            chathistory[i][3] = newcolor;
        }
    }
}



io.on('connection', (socket) => {
    socket.on('signup', (username,password) => {
         console.log(username);
         console.log(password);
        var usernameIsValidx = usernameIsValid(username);
        var passwordIsvalidx = usernameIsValid(password);
        var nameexit = checkexistingUsername(username);
        if (nameexit === false){
            socket.emit('failsignup2');
        }
        // console.log("password" + oo);
        // console.log("password" + kk);
        if (usernameIsValidx && passwordIsvalidx){
            if(nameexit) {
                userArray.push(username);
                userPassword.push(password);
                usercolor.push("#85FFBD");
                socket.emit('signup', username);
            }
        }else {
            socket.emit('failsignup1', username);
        }

    });
});

io.on('connection', (socket) => {
    socket.on('signuppage', (username) => {
        socket.emit('signuppage',username);
    });
});

io.on('connection', (socket) => {
    socket.on('loginF5', (username) => {
        //console.log(currentUser);
        console.log("loginF5    " + currentlogin);
        socket.emit('loginF5',currentlogin, currentUser,chathistory, currentUsername);
    });
});

io.on('connection', (socket) => {
    socket.on('removeCu', (username) => {
        // console.log("RemoveCU Original  "+ currentlogin)
        // console.log("RemoveCU username  "+ username);
        var index = currentlogin.indexOf(username);
        // console.log("RemoveCU index   " + index);
        var cc = currentlogin.splice(index,1);
        // console.log("RemoveCU index  " + cc);
        // console.log("RemoveCU currentLogin  " + currentlogin);
        io.emit('updatesider',currentlogin,username);
        socket.emit('logout');
    });
});

io.on('connection', (socket) => {
    socket.on('addcurrent', (username) => {
        currentlogin.push(username);
        io.emit('updatesider',currentlogin,username);
    });
});



function testColor(color) {
    var re1 = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;
    var re2 = /^rgb\(([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\)$/i;
    var re3 = /^rgba\(([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,([0-9]|[0-9][0-9]|25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9])\,(1|1.0|0.[0-9])\)$/i;
    return re2.test(color) || re1.test(color) || re3.test(color);
}


