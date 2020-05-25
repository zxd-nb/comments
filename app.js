var http = require('http');

var fs = require('fs');

var server = http.createServer();

var template = require('art-template');

var u = require('url');

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'messages'
});

connection.connect();

server.listen(3000, function () {
    console.log('server running...')
})



server.on('request', function (req, res) {
    var parsed = u.parse(req.url, true);

    var url = req.url;

    if (url == '/') {
        fs.readFile('./views/index.html', function (err, data) {
            if (err) {
                res.end('404')
            } else {
                var msgs = [];

                var a = new Promise((resolve, reject) => {
                    connection.query('SELECT * FROM MSG', function (error, results, fields) {
                        if (error) {
                            reject(error)
                        } else {
                            resolve(results);
                        }
                    });
                })

                a.then((d, err) => {
                    if (d) {
                        var results = d;
                        for (let i = 0; i < results.length; i++) {
                            let m = {};
                            m.name = results[i].msg_name;
                            m.msg = results[i].msg_content;
                            m.date = results[i].msg_date;
                            msgs.unshift(m);
                        }
                        var result = template.render(data.toString(), {
                            msgs: msgs
                        });
                        res.end(result);
                    } else {
                        console.log(err);
                    }
                });
            }
        })
    } else if (url == '/post') {
        fs.readFile('./views/post.html', function (err, data) {
            if (err) {
                res.end('404')
            } else {
                res.end(data);
            }
        })
    } else if (url.indexOf('/public') == 0) {
        fs.readFile('.' + url, function (err, data) {
            if (err) {
                res.end('404')
            } else {
                res.end(data);
            }
        })
    } else if (url.indexOf('/comment') == 0) {
        var query = parsed.query;
        var d = new Date().toISOString();
        query.date = d;
        var toInsert = [];
        toInsert.push(query.name);
        toInsert.push(query.msg);
        toInsert.push(query.date);

        var addSql = 'INSERT INTO MSG(msg_id,msg_name,msg_content,msg_date) VALUES(0,?,?,?)';
        var addSqlParams = toInsert;

        connection.query(addSql, addSqlParams, function (err, result) {
            if (err) {
                res.end('404');
            }
        })


        res.statusCode = 302;
        res.setHeader('Location', '/');
        res.end();
    } else {
        fs.readFile('./views/404.html', function (err, data) {
            if (err) {
                res.end('404')
            } else {
                res.end(data);
            }
        })
    }
})
