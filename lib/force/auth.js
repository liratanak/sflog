/**
 * Force Auth
 */

var jsforce = require('jsforce');
var Promise = require('bluebird');
var log = require('captains-log')();

/**
 * [auth description]
 * @return Promise
 */
var Auth = function() {
	var that = this;
	this.connection = new jsforce.Connection({maxRequest: 200});

	this.getConnection = function() {
		return new Promise(function (resolve, reject) {
			resolve( that.connection );
		});
	};

	this.login = function( config ) {
		log( 'config: ', config );
		return new Promise(function (resolve, reject) {
			if( typeof that.connection !== 'undefined' && that.connection.accessToken ) {
				log('Authenticated!');

				resolve( that.connection );
				return;
			}

			that.connection
				.login( config.username, config.passwordToken )
				.then(function( forceResponse ) {
					resolve( that.connection );
				});
		});
	};
};

module.exports = exports = Auth;