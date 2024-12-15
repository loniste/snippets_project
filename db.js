const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '195.200.14.76',
  port: 3306,
  user: 'loniste',
  password: 'loniste_dolimoni',
  database: 'snippets_db',
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database!');
});
module.exports = connection;
