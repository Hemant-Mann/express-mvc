var mongoose = require('mongoose');
var config = require('./config');

module.exports = function (env) {
    var dbURI, options, db;

    if (env === 'production') {
        dbURI = 'mongodb://' + config.user + ':' + config.pass + config.dburl + '/' + config.db;
    } else {
        dbURI = 'mongodb://' + config.dburl + '/' + config.db;
    }
    options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
    db = mongoose.connect(dbURI, options);

    return db;
};
