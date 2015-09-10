/**
 * SFlog lib
 */

var _ = require('lodash');
var log = require('../util/log');
var Promise = require('bluebird');

var SFLog = function( options ) {
	options = _.assign({
		pullingInterval: 1000,
		version: 'v32.0'
	}, options);

	this.lastId = null;
	this.lastSystemModstamp = null;
	this.counter = 0;
	this.connection = options.connection;
	this.pullingInterval = options.pullingInterval;
	this.version = options.version;
};

SFLog.prototype.tail = function() {
	this.pullingLog();
	log.info('Pulling log every ' + this.pullingInterval + 'ms ...');
};

SFLog.prototype.getLogBody = function( logId ) {
	var this_ = this;
	return new Promise(function (resolve, reject) {
		this_.connection.request({
			method: 'get',
			url: '/services/data/' + this_.version + '/tooling/sobjects/ApexLog/' + logId + '/Body'
		}, function(err, response) {
			if( err ) {
				reject( err );
				return;
			}

			resolve( response );
		});
	});
};

SFLog.prototype.log = function( options ) {
	var this_ = this;
	return new Promise(function (resolve, reject) {
		this_.getLogsBody(options).then(function( logsBody ) {
			_.forEach(logsBody, function( iLogBody ) {
				if( !_.isString( iLogBody ) ) return;
				console.log( iLogBody );
//				iLogBody.split(/\n/).forEach(function( iOneLogLine ) {
//					console.log( iOneLogLine );
//				});
			})
			resolve();
		}).catch(function( e ) {
			log.error( 'log: ', e );
			reject();
		});
	});
};

SFLog.prototype.getLogsBody = function( options ) {
	var this_ = this;
	return new Promise(function (resolve, reject) {
		this_.getLogsId(options).then(function( logsId ) {
			log.info( 'id: ', JSON.stringify(logsId) );
			return Promise.all(_.map(logsId, function( iLogId ) {
				return this_.getLogBody( iLogId );
			}));
		}).then(function( logsBody ) {
			log.silly('getLogsBody: length', logsBody.length);
			resolve( logsBody );
		}).catch(function( e ) {
			log.error( 'getLogsBody: ', e );
			reject();
		});
	});
};


SFLog.prototype.getLogsId = function( options ) {
	var this_ = this;

	return new Promise(function (resolve, reject) {
		options = _.assign({
			startTamp: this_.lastSystemModstamp,
			endTamp: this_.lastSystemModstamp
		}, options);

		var queryString = 'SELECT Id \
							FROM ApexLog \
							WHERE SystemModstamp > ' + options.startTamp + '\
								AND SystemModstamp <= ' + options.endTamp + '\
							ORDER BY SystemModstamp DESC \
							'.replace(/\s/g, ' ');

		log.silly( 'log: options: queryString: ', options, queryString );

		this_.connection
			.query( queryString )
			.then(function( queryResult ) {
				log.silly( 'getLogsId: queryResult: ', queryResult );
				log.info( (queryResult.totalSize > 1)?'got ' + queryResult.totalSize + ' new logs ':'got 1 new log ' );
				resolve( _.map(queryResult.records, function( iRecord ) {
					return iRecord.Id;
				}));
			}).catch(function() {
				log.error( 'getLogsId: ', e );
				reject( e );
			});
	});
};

SFLog.prototype.pullingLog = function( options ) {
	options = _.assign({
		query: 'SELECT Id, SystemModstamp FROM ApexLog ORDER BY SystemModstamp DESC LIMIT 1'
	}, options);
	var this_ = this;
	var queryResultTmp = {};

	this_.connection
		.query( options.query )
		.then(function( queryResult ) {
			log.silly( 'pullingLog: queryResult: ', queryResult );

			// TODO better way ?
			queryResultTmp = queryResult; //Make a backup

			if( queryResult.done
				&& _.isNumber( queryResult.totalSize )
				&& queryResult.totalSize >= 0
				&& _.isArray( queryResult.records )
			) {
				if( _.isEmpty( queryResult.records ) ) {
					return Promise.resolve();
				}

				if( this_.lastId === null ) {
					// TODO: First start
					this_.lastId = queryResult.records[0].Id;
					this_.lastSystemModstamp = queryResult.records[0].SystemModstamp;
				} else if( this_.lastId !== null && this_.lastId !== queryResult.records[0].Id ) {
					// TODO: New logs found
					log.silly('lastId: ', this_.lastId, 'newId: ',  queryResult.records[0].Id);

					// TODO List all logs contents
					return this_.log({
						startTamp: this_.lastSystemModstamp,
						endTamp:queryResult.records[0].SystemModstamp
					});
				}
				return Promise.resolve();
			}

			return Promise.reject( new Error('pullingLog with unexpected result.') );
		}).then(function() {
			if( !_.isEmpty( queryResultTmp.records ) ) {
				this_.lastId = queryResultTmp.records[0].Id;
				this_.lastSystemModstamp = queryResultTmp.records[0].SystemModstamp;
			}

			setTimeout(function() {
				this_.pullingLog({
					query: 'SELECT Id, SystemModstamp FROM ApexLog WHERE SystemModstamp > '
						+ this_.lastSystemModstamp
						+ ' ORDER BY SystemModstamp DESC LIMIT 1'
				});
			}, this_.pullingInterval);
		})
		.catch(function( e ) {
			log.error( e );
			this_.pullingLog();
		});

};

module.exports = exports = SFLog;