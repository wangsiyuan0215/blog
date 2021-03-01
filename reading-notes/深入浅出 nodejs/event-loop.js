setImmediate(function() {
	console.log('2');
});
setTimeout(function() {
	console.log('1');
}, 0);
