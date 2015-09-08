/**
 * SFlog
 */

var force = require('./lib/force');
var log = require('captains-log')();
var config = require('./config.json');
var SFLog = require('./lib/sflog')

log.info('Autenticating...');
force.auth.login({
	username: config.org.username,
	passwordToken: config.org.password + config.org.secretToken,
}).then(function( authConnection ) {
	log.info('Autenticated');
	return new SFLog({
		connection: force.auth.connection
	}).tail();
}).catch(function( e ) {
	log.error( e );
});