const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: '195.200.14.76',
  port: 3306,
  user: 'loniste',
  password: 'loniste_dolimoni',
  database: 'snippets_db',
});


module.exports = connection;
