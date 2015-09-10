/**
 * Default Logs
 */

var logPrefix = 'sflog';
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