#!/usr/bin/env node

/**
 * SFlog
 */
var app = require('commander');
var force = require('./lib/force');
var log = require('./lib/util/log');
var config = require('./config.json');
var SFLog = require('./lib/sflog');
var _ = require('lodash');

app
	.version('0.0.1')
	.option('-o, --org [org]', 'Pro/Dev/Sandbox Org')
	.option('--silly', 'Silly log')
	.parse(process.argv);

var org = ( app.org || 'org' );

log.silly( 'org: config[org]: ', org, config[org] );
if( _.isEmpty( config[org] ) ) {
	log.error( 'Org was not specified.' );
	process.exit(1);
}

log.info('Autenticating...');
force.auth.login({
	username: config[org].username,
	passwordToken: config[org].password,
	instanceUrl: config[org].instanceUrl,
	accessToken: config[org].accessToken
}).then(function( identity ) {
	log.silly( 'identity: ', identity );
	log.info('Autenticated as ' + identity.username );
	return new SFLog({
		connection: force.auth.connection,
		timeout: config.timeout
	}).tail();
}).catch(function( e ) {
	log.error( e );
});