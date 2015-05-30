var settings = require('../settings');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
module.exports = new Db(settings.db.name, new Server(settings.db.host, settings.db.port, {auto_reconnect: true}));