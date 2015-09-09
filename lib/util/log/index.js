/**
 * Default Logs
 */

var config = require('../../../config.json');

var logPrefix = (config.logPrefix || 'SFLog ');
module.exports = exports = require('captains-log')({
	prefixTheme: 'custom',
	prefixThemes: {
		custom: {
			silly: logPrefix + 'silly: ',
			verbose: logPrefix + 'verbose: ',
			info: logPrefix + 'info: ',
			blank: '',
			debug:  'debug: ',
			warn: logPrefix + 'warn: ',
			error: logPrefix + 'error: ',
			crit: logPrefix + 'CRITICAL: '
		}
	}
});