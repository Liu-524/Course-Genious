var app = require('express')();
var qs = require('querystring');
var bodyParser = require('body-parser');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG, O_NONBLOCK } = require('constants');
var cookieParser = require('cookie-parser');
const { pid, allowedNodeEnvironmentFlags } = require('process');
var http = require('http').Server(app);

app.use(cookieParser());
app.use(bodyParser.json());

var sql = require("mysql");
//const { RESERVED_EVENTS } = require('socket.io/dist/socket');
var sql_con = sql.createConnection({
    user: 'dev',
    password: "411-t7",
    host: "35.221.70.238",
    database : "cs411db",
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

app.get("/secret", function(req, res) {
    var query_string = "CALL advancedP()"
    sql_con.query(query_string, function(err, result) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        console.log(result);
        res.send("OK");
    });
});

app.post("/serverlet", function(req, res) {
    console.log(req.body);
    if (req.body.action === 'login') {
        var uemail = req.body.username
        var pwd = req.body.pwd
        var query_str = "SELECT * FROM User WHERE email = '" + req.body.username + "' LIMIT 1"
        sql_con.query(query_str, function (error, results, fields) {
            if (error) {
                res.send({result:0});
                res.end();
                return;
            }
            if (results.length == 0) {
                res.send({result:0});
                res.end();
                return;
            } else {
                console.log(results[0])
                if (req.body.pwd === results[0].pwd) {
                    res.send({result:1, 
                        uid: results[0].uid
                    })
                } else {
                    res.send({result:0});
                    res.end();
                    return;
                }
            }
        });
    } else if (req.body.action === 'post-comment') {
        var data = req.body.data.replace(new RegExp('&',"gm"),'", "')
        data = data.replace(new RegExp('=',"gm"), '":"')
        data = data.replace(new RegExp('%2B',"gm"), '+')
        data = '{"' + data + '"}'
        console.log(data)
        data = JSON.parse(data)
        var query_str = "INSERT INTO info(uid, cid, rating, grade, content) VALUES (" + req.body.uid + ", "+ req.body.cid + ", "
        + data.rating + ", '" + data.grade + "', '" + data.content +"')" 
        console.log(query_str)
        sql_con.query(query_str, function(err, results) {
            if (err) {
                console.log(err)
                res.send({result : 0,
                    message : "database error!"
                })
                res.end()
            } else {
                res.send({result:1})
            }
        });
    } else if (req.body.action === 'signin') {
        var colli = false
        var query_str = "SELECT * FROM User WHERE email = '" + req.body.username + "' LIMIT 1"
        sql_con.query(query_str, function (error, results, fields) {
            if (error) {
                res.send({result:0})
                res.end()
            }
            console.log('The solution is: ' + results.length);
            if (results.length == 1) {
                res.send({result : 0})
                res.end()
            } else {
                query_str = "INSERT INTO User(email, pwd, uname) VAlUES('" + req.body.username + "', '" + req.body.pwd + "', '" + req.body.name + "')"
                console.log(query_str)
                sql_con.query(query_str, function(err, results) {
                    if (err) {
                        console.log(err)
                        res.send({result : 0,
                            message : "database error!"
                        })
                        res.end()
                    } else {
                        res.send({result : 1})
                        res.end()
                    }
                });
            }
        }); 
        sql_con.commit()
    } else if (req.body.action === 'request-page') {
        var query_str = "SELECT * FROM info NATURAL JOIN User WHERE cid = " + req.body.cid;
        var obj = {}
        console.log(query_str)
        sql_con.query(query_str, function(err, results) {
            if (err) {
                console.log(err)
                res.send({result : 0,
                    message : "database error!"
                })
                return
            } else {
                obj.commentlist = results
                query_str = "SELECT * FROM Assignment NATURAL JOIN User WHERE cid = " + req.body.cid;
                sql_con.query(query_str, function(err, results) {
                    if (err) {
                        console.log(err)
                        res.send({result : 0,
                            message : "database error!"
                        })
                        return
                    } else {
                        obj.asmtlist = results
                        query_str = "SELECT * FROM Course WHERE cid = " + req.body.cid;
                        sql_con.query(query_str, function(err, results) {
                            if (err) {
                                console.log(err)
                                res.send({result : 0,
                                    message : "database error!"
                                })
                                return
                            } else {
                                obj.result = 1
                                obj.course_info = results[0]
                                console.log(obj)
                                res.send(obj)
                            }
                        })
                        
                    }
                });
                
            }
        });
    } else if (req.body.action === 'post-asmt') {
        var data = req.body.data.replace(new RegExp('&',"gm"),'", "')
        data = data.replace(new RegExp('=',"gm"), '":"')
        data = '{"' + data + '"}'
        console.log(data)
        data = JSON.parse(data)
        var query_str = "INSERT INTO Assignment(uid, cid, type, grading, workload, comment) VALUES (" + req.body.uid + ", "+ req.body.cid + ", '"
        + data.type + "', '" + data.grading + "', '" + data.workload + "', '" + data.content + "')"
        console.log(query_str)
        sql_con.query(query_str, function(err, results) {
            if (err) {
                console.log(err)
                res.send({result : 0,
                    message : "database error!"
                })
                res.end()
            } else {
                res.send({result : 1})
            }
        });
        sql_con.commit()
    } else if (req.body.action === 'del_asmt') {
        var query_str = "DELETE FROM Assignment WHERE cid = " +req.body.cid +" AND uid = " + req.body.uid;
        console.log(query_str)
        sql_con.query(query_str, function(err, results) {
            if (err) {
                res.send({result : 0})
            } else {
                res.send({result : 1})
            }
        });
        sql_con.commit()
    } else if (req.body.action === 'del_cmt') {
        var query_str = "DELETE FROM info WHERE cid = " +req.body.cid +" AND uid = " + req.body.uid;
        console.log(query_str)
        sql_con.query(query_str, function(err, results) {
            if (err) {
                res.send({result : 0})
            } else {
                res.send({result : 1})
            }
        });
        sql_con.commit()
    } else if (req.body.action === 'fetch_user') {
        var query_str = "SELECT * FROM Assignment WHERE uid=" + req.body.uid
        console.log(query_str)
        var obj = {}
        sql_con.query(query_str, function(err, results) {
            if (err) {
                res.send({result : 0})
                console.log(err)
                return
            } else {
                obj.asmt_list = results
                query_str = "SELECT * FROM info WHERE uid=" + req.body.uid
                sql_con.query(query_str, function(err, results) {
                    if (err) {
                        res.send({result : 0})
                        return
                    } else {
                        obj.comment_list = results
                        console.log(obj)
                        res.send(obj)
                    }
                })
            }
        })
    } else if (req.body.action === 'remove_acc') {
        var query_str = "DELETE FROM User WHERE uid = " + req.body.uid
        sql_con.query(query_str, function(err, results) {
            if (err) {
                res.send({result : 0})
                return
            } else {
                res.send({result : 1})
            }
        })
        sql_con.commit()
    } else if (req.body.action === 'fetch_board') {
        var query_str = "SELECT DISTINCT lname, fname, rating FROM Instructor ORDER BY rating DESC LIMIT 100"
        sql_con.query(query_str, function(err, results) {
            if (err) {
                console.log(err)
                res.send({result : 0})
                return
            } else {
                res.send({result : 1, board : results})
            }
        })
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