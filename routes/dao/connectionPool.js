var mysql = require('mysql');

// var pool = mysql.createPool
// ({
//     connectionLimit: 1000,
//     queueLimit: 500,
//     host: '127.0.0.1',
//     user: 'root',
//     password: '',
//     port: '3306',
//     database: 'ezcloud',
//     multiplestatements : true
//     });

 // dev  
        var pool = mysql.createPool
        ({
            connectionLimit: 1000,
            queueLimit: 500,
            host: 'ezcloud.cw76zcmtngkc.us-east-1.rds.amazonaws.com',
            user: 'ezcloudadmin',
            password: 'EzAdmin*123',
            port: '3306',
            database: 'ezcloud',
            multiplestatements : true
            });
            
    module.exports = pool;
