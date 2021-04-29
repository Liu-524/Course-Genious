var app = require('express')();
var qs = require('querystring');
var bodyParser = require('body-parser');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
var cookieParser = require('cookie-parser');
const { pid, allowedNodeEnvironmentFlags } = require('process');
var http = require('http').Server(app);

app.use(cookieParser());
app.use(bodyParser.json());

var sql = require("mysql");
//const { RESERVED_EVENTS } = require('socket.io/dist/socket');
var sql_con = sql.createConnection({
    user: 'root',
    password: "123456",
    host: "localhost",
    database : "s3",
    port : 3306
});
sql_con.connect();

app.get("/node_modules/*", function(req, res) {
  res.sendFile(__dirname + req.path);
});

app.get("/", function(req, res) {
    res.status(200).send("hello");
});
app.get("/index", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.get("/demo", function(req, res) {
    res.sendFile(__dirname + "/demo.html");
});
app.post("/database",function(req, res) {
    console.log(req.body.command);
    var query_string = req.body.command;
    sql_con.query(query_string, function(err, result) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        console.log(result);
        res.send(result);
    });
});

app.post("/serverlet", function(req, res) {
    console.log(req.body);
    if (req.body.action === 'login') {
        res.send({result : 1, 
            content : {}
        });
    } else if (req.body.action === 'post-comment') {
        var data = req.body.data.replace(new RegExp('&',"gm"),'", "')
        data = data.replace(new RegExp('=',"gm"), '":"')
        data = '{"' + data + '"}'
        data = JSON.parse(data)
        console.log(data.rating == 1)
        res.send("OK")
    }
})

app.post('/searchres', function (req, res) {
    var tempD = req.body
    console.log('req body: ', tempD);
    sql_con.query(tempD.command, function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
        res.send(results); 
      });
 })

http.listen(8080,function(){
    console.log('listening on *:8080');
});