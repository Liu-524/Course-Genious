var express = require('express');
var app = express();
var http = require('http');
var fs = require('fs');
var mysql = require('mysql');
var bodyParser = require('body-parser');
const { response } = require('express');
var tempD;
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'sys'
});


app.get('/search/', function (req, res) {
    //res.send('Hello World33');
        res.sendFile('/Users/lucas/OneDrive/UIUC/CS 411/cs411-t7/index.html');
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


app.use(bodyParser.json());

//app.use(bodyParser.text());


 app.post('/searchres', function (req, res) {
    console.log('req body: ', req.body);
    
    connection.query(req.body.command, function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
        res.send(results); 
      });
 })

    
var server = app.listen(8085, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
 
})