const express = require('express');
const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'WebCrawl'
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('DB Connected');
});

const app = express();

app.get('/actors', (req, res) => {

    let sql = 'SELECT * FROM Actors ORDER BY ID DESC';
    let pageSize = req.query.page_size;
    let pageNum = req.query.page_num;

    if (pageSize && pageNum) {
        let start = pageSize * (pageNum - 1);
        let end = pageSize * pageNum;
        sql += ' LIMIT ' + pageSize + ' OFFSET ' + pageSize * pageNum + ';';
    }

    console.log(sql);
    
    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get('/actors/:id', (req, res) => {

    if (!req.params.id) {
        throw new Error('Param not found: id');
    }

    if (req.params.id.match(/^[0-9]+$/) == null) {
        throw new Error('Invalid id, couldn\'t parse');
    };

    let sql = 'SELECT * FROM Actors WHERE ID = ' + req.params.id;
    console.log(sql);
    
    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.get('/test', (req, res) => {
    var params = req.params;

    res.send(req.query.page);
});

app.listen('3000', () => {
    console.log('Server started on port 3000');
})
