var express = require('express');
var app = express();
app.listen(3000, function() {
    console.log('Node server running @ http://localhost:3000')
});
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "admin",
    password: "admin1",
    database: "ewallet"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!!!")
});
var sql = "insert into User (Username,sdt,email,password) value ('Minh',123,'fsada','dwasdw');";
con.query(sql, function(err, results) {
    if (err) throw err;
})