/**
 * SFlog lib
 */

var _ = require('lodash');
var log = require('captains-log')();


var SFLog = function( options ) {
	options = _.assign({}, options);

	this.lastId = null;
	this.lastSystemModstamp = null;
	this.counter = 0;
	this.connection = options.connection;
};

SFLog.prototype.tail = function() {
	var this_ = this;

	setInterval(function() {
		this_.connection
			.query("SELECT Id FROM ApexLog ORDER BY SystemModstamp DESC LIMIT 1")
			.then(function( queryResult ) {
				// console.log( 'queryResult: ', queryResult );
				if( queryResult.done
					&& _.isNumber( queryResult.totalSize )
					&& queryResult.totalSize > 0
					&& _.isArray( queryResult.records )
					&& !_.isEmpty( queryResult.records )
				) {
					if( this_.lastId === null ) {
						// TODO: First start
						this_.lastId = queryResult.records[0].Id;
					} else if( this_.lastId !== null && this_.lastId !== queryResult.records[0].Id ) {
						// TODO: New logs found
						log('lastId: ', this_.lastId, 'newId: ',  queryResult.records[0].Id);
						this_.lastId = queryResult.records[0].Id;
					}
				}
			})
			.catch(function( e ) {
				log.error( e );
			})
			;
	}, 1000);
};

module.exports = exports = SFLog;