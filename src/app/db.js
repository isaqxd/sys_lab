const mysql = require('mysql2')

const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'sys_lab',
    port: 3306

})

db.connect(err =>{
    if (err) throw err;
    console.log('banco de dados conectado')
})

module.exports = db;