/**
 * SFlog
 */

var force = require('./lib/force');
var log = require('./lib/util/log');
var config = require('./config.json');
var SFLog = require('./lib/sflog')

log.info('Autenticating...');
force.auth.login({
	username: config.org.username,
	passwordToken: config.org.password + config.org.secretToken,
}).then(function( authConnection ) {
	log.silly( 'authConnection: ', authConnection );
	log.info('Autenticated as ' + config.org.username + ' [ID: ' + authConnection.userInfo.id + ' ]' );
	return new SFLog({
		connection: force.auth.connection,
		timeout: config.timeout
	}).tail();
}).catch(function( e ) {
	log.error( e );
});