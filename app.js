/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , path = require('path')
    , io = require('socket.io');
var app = express();

// Configuration

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

var  server = http.createServer(app);
io = io.listen(server);

app.get('/', routes.index);

server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

io.configure(function () {
    io.configure(function () {
//        io.set('log level', '3');
        io.set('authorization', function (handshakeData, callback) {
            if (handshakeData) {
                callback(null, true);
            } else {
                callback(null, false);
            }

        });
    });
    io.set('transports', ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
});


io.sockets.on('connection', function (socket) {

    socket.join('room1');

    socket.on('pull', function () {
        socket.emit('getTime', { currentTime:date2str(new Date(), "yyyy/MM/dd hh:mm:ss")})
    });

    socket.on('push', function (data) {
        console.log(data.time);
    });

    socket.on('formselect', function (data) {
        console.log(data);
        socket.broadcast.to('room1').emit('forbidden', { elementname:data.elementname});

    });
    socket.on('formnotselect', function (data) {
//      io.sockets.in('room1').emit('forbidden', { elementname: data.elementname}); //对所有在room1里的client发送消息
        socket.broadcast.to('room1').emit('agree', { elementname:data.elementname}); //对除了当前建立连接的其他client发送消息
    });

});


function date2str(x, y) {
    var z = {M:x.getMonth() + 1, d:x.getDate(), h:x.getHours(), m:x.getMinutes(), s:x.getSeconds()};
    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
        return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2)
    });
    return y.replace(/(y+)/g, function (v) {
        return x.getFullYear().toString().slice(-v.length)
    });
}
