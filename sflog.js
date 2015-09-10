#!/usr/bin/env node

/**
 * SFlog
 */
var app = require('commander');
var _ = require('lodash');

var force = require('./lib/force');
var log = require('./lib/util/log');
var config = require('./config.json');
var SFLog = require('./lib/sflog');

app
	.version('0.0.1')
	.option('-c, --config [path]', 'Custom config file')
	.option('-o, --org [org]', 'Pro/Dev/Sandbox Org')
	.option('-u, --username [username]', 'Username')
	.option('-p, --password [password]', 'Password concat with token')
	.option('-i, --instance-url [instanceUrl]', 'jsforce\'s instanceUrl see: https://jsforce.github.io/document/#access-token')
	.option('-a, --access-token [accessToken]', 'jsforce\'s accessToken see: https://jsforce.github.io/document/#access-token')
	.option('-m, --mm [path]', 'Using MaventsMate session file')
	.option('--silly', 'Set log level to silly')
	.option('--verbose', 'Set log level to verbose')
	.option('--silent', 'Set log level to silent')
	.parse(process.argv);

log.silly( 'app: ', app );

var org = app.org;
var isValidAuth = false;
var usableConfig = {};

if( typeof app.config === 'string' ) {
	try {
		config = _.assign(config, JSON.parse( require("fs").readFileSync( app.config ) ));
	} catch( e ) {
		log.error( 'Not found/Invalid config file in ' + app.config );
	}
}

config[org] = config[org] || {};

// Default options
usableConfig = _.assign({
	logPrefix: 'sflog ',
	pullingInterval: 5000
}, config);

// MavensMate session id and instance url
var mm = {};
var mmSessionFilePath = null;

if( typeof app.mm === 'boolean' ) {
	mmSessionFilePath = process.cwd() + '/config/.session';
} else if ( typeof app.mm === 'string' ) {
	mmSessionFilePath = app.mm;
}

if( app.mm ) {
	try {
		var fs = require("fs");
		var mmSession = JSON.parse( fs.readFileSync( mmSessionFilePath ) );

		mm = {
			instanceUrl: mmSession.server_url.replace(/\/services.*/, ''),
			accessToken: mmSession.sid
		};

		log.silly( 'mmSession: ', mmSession, mm );
	} catch( e ) {
		// Ignore if not exist or error
		// log.error( e );
		log.error( 'Not found/Invalid MavensMate session file in ' + mmSessionFilePath );
	}
}

// END MavensMate

usableConfig[org] = {
	username: app.username || config[org]['username'] || '',
	password: app.password || config[org]['password'] || '',
	instanceUrl: app.instanceUrl || mm['instanceUrl'] || config[org]['instanceUrl'] || '',
	accessToken: app.accessToken || mm['accessToken'] || config[org]['accessToken'] || ''
};

log.silly( 'org: usableConfig[org]: ', org, usableConfig[org] );

// TODO: Check for valid format
if( !_.isEmpty( usableConfig[org].username ) && !_.isEmpty( usableConfig[org].password ) ) {
	isValidAuth = true;
}

log.silly( 'isValidAuth: ', isValidAuth );

// TODO: Check for a valid format of instanceUrl & accessToken
if( !_.isEmpty( usableConfig[org].instanceUrl ) && !_.isEmpty( usableConfig[org].accessToken ) ) {
	isValidAuth = true;
}

if( !isValidAuth ) {
	app.outputHelp();
	process.exit(1);
}

log.info('Authenticating ...');
force.auth.login({
	username: usableConfig[org].username,
	passwordToken: usableConfig[org].password,
	instanceUrl: usableConfig[org].instanceUrl,
	accessToken: usableConfig[org].accessToken
}).then(function( identity ) {
	log.silly( 'identity: ', identity );
	log.info('Authenticated as ' + identity.username );
	return new SFLog({
		connection: force.auth.connection,
		pullingInterval: usableConfig.pullingInterval
	}).tail();
}).catch(function( e ) {
	log.error( e );
});