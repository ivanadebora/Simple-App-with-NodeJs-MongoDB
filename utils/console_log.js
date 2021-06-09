'use strict';

function info(text) {
	return console.log('\x1b[36m%s\x1b[0m', text);
}

function error(text) {
	return console.log('\x1b[31m%s\x1b[0m', text);
}

module.exports = {
	info,
	error
}