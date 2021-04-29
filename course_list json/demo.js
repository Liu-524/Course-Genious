//express_demo.js 文件


var express = require('express');
var app = express();

var http = require('http');
	// 声明文件操作系统对象
var fs = require('fs');

var mysql = require('mysql');
var bodyParser = require('body-parser');
var tempD;
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'sys'
});

app.get('/search/', function (req, res) {
    //res.send('Hello World33');
        res.sendFile('/Users/lucas/OneDrive/UIUC/CS 411/stage5/express/bs.html');
       

 })

app.post('/search/', function (req, res) {
    res.send()
    connection.connect();
    connection.query('SELECT * FROM Majors  LIMIT 5', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
        res.send(results);
      });

})


app.use(bodyParser.json());

//app.use(bodyParser.text());
app.post('/searchres', function (req, res) {
    tempD = req.body;

    console.log('req body in POST: ', req.body);

 })

 app.get('/searchres', function (req, res) {
    console.log('req body: ', tempD);
    
    connection.query(tempD.command, function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
        res.send(results); 
      });

 })
 



    
var server = app.listen(8084, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})