/**
 * Force Auth
 *
 */
var jsforce = require('jsforce');
var Promise = require('bluebird');

var log = require('../util/log');

var Auth = function() {
	var this_ = this;

	this_.defaultConnectionOption = {maxRequest: 200};
	this_.connection = new jsforce.Connection( this_.defaultConnectionOption );

	this_.identity = null;

	this_.getConnection = function() {
		return new Promise(function (resolve, reject) {
			resolve( this_.connection );
		});
	};

	/**
	 * A wrapper to jsforce.connection.login for not re-login when already connected
	 * and returning a jsforce identity object
	 *
	 * @param {Object} [config] - login config
	 * @param {String} [options.username]
	 * @param {String} [options.passwordToken]
	 * @param {String} [options.accessToken]
	 * @param {String} [options.accessToken]
	 * @return {Promise.<Object>}
	 */
	this_.login = function( config ) {
		log.silly( 'config: ', config );
		return new Promise(function (resolve, reject) {

			if(
				typeof config.accessToken === 'string'
				&& config.accessToken !== ''
				&& typeof config.instanceUrl === 'string'
				&& config.instanceUrl !== ''
			 ) {
				this_.defaultConnectionOption.accessToken = config.accessToken;
				this_.defaultConnectionOption.instanceUrl = config.instanceUrl;

				this_.connection = new jsforce.Connection( this_.defaultConnectionOption );

				this_.connection.identity().then(function( identity ) {
					this_.identity = identity;
					resolve( identity );
				}).catch(function( e ) {
					reject( e );
				});
				return;
			}

			if( null !== this_.identity ) {
				resolve( this_.identity );
				return;
			}

			this_.connection
				.login( config.username, config.passwordToken )
				.then(function() {
					return this_.connection.identity();
				}).then(function( identity ) {
					this_.identity = identity;
					resolve( identity );
				}).catch(function( e ) {
					reject( e );
				});
		});
	};
};

module.exports = exports = Auth;