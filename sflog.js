#!/usr/bin/env node
'use strict';

/**
 * SFlog
 */
var app = require('commander');
var _ = require('lodash');

var force = require('./lib/force');
var log = require('./lib/util/log');
var SFLog = require('./lib/sflog');
var path = require('path');

app
	.version('0.0.1')
	.option('-c, --config [path]', 'Custom config file')
	.option('-o, --org [org]', 'Pro/Dev/Sandbox Org')
	.option('-u, --username [username]', 'Username')
	.option('-p, --password [password]', 'Password concat with token')
	.option('-i, --instance-url [instanceUrl]', 'jsforce\'s instanceUrl see: https://jsforce.github.io/document/#access-token')
	.option('-a, --access-token [accessToken]', 'jsforce\'s accessToken see: https://jsforce.github.io/document/#access-token')
	.option('--forcecode [path]', 'Using ForceCode config file')
	.option('--pulling-interval [interval]', 'Pulling interval in milliseconds should >= 1000', parseInt)
	.option('--silly', 'Set log level to silly')
	.option('--verbose', 'Set log level to verbose')
	.option('--silent', 'Set log level to silent')
	.parse(process.argv);

log.silly( 'app: ', app );

var org = app.org || 'dev';
var isValidAuth = false;

var config = {};
var usableConfig = {};

if( typeof app.config === 'string' ) {
	try {
		var configPath = path.resolve(app.config);
		log.silly( 'configPath: ', configPath );

		config = _.assign(config, JSON.parse( require("fs").readFileSync( configPath ) ) );
	} catch( e ) {
		log.error( 'Not found/Invalid config file in ' + app.config );
	}
}

config[org] = ( config[org] || {} );

// Default options
usableConfig = _.assign({
	logPrefix: 'sflog ',
	pullingInterval: 5000
}, config);

// 1s
if( typeof app.pullingInterval === 'number' && app.pullingInterval >= 1000 ) {
	usableConfig.pullingInterval = app.pullingInterval;
}

// ForceCode
var forcecodeConfig = {};
var forcecodeConfigPath = null;

if( typeof app.forcecode === 'boolean' ) {
	forcecodeConfigPath = path.resolve('./force.json');
} else if ( typeof app.forcecode === 'string' ) {
	forcecodeConfigPath = path.resolve(app.forcecode);
}

log.silly( 'app.forcecode: ', app.forcecode );
if( app.forcecode ) {
	try {
		var fs = require("fs");
		var forcecodeConfigJson = JSON.parse( fs.readFileSync( forcecodeConfigPath ) );

		forcecodeConfig = {
			loginUrl: forcecodeConfigJson.url,
			username: forcecodeConfigJson.username,
			password: forcecodeConfigJson.password
		};

		log.silly( 'forcecodeConfig: ', forcecodeConfig );
	} catch( e ) {
		// Ignore if not exist or error
		log.error( e );
		// log.error( 'Not found/Invalid MavensMate session file in ' + forcecodeConfigPath );
	}
}

// END ForceCode
usableConfig[org] = {
	loginUrl: forcecodeConfig['loginUrl'] || null,
	username: app.username || config[org]['username'] || forcecodeConfig['username'] || null,
	password: app.password || config[org]['password'] || forcecodeConfig['password'] || null,
	instanceUrl: app.instanceUrl || config[org]['instanceUrl'] || null,
	accessToken: app.accessToken || config[org]['accessToken'] || null
};

log.silly( 'org: usableConfig: ', org, usableConfig );

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
	loginUrl: usableConfig[org].loginUrl,
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