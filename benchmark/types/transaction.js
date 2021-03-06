'use strict';

exports = module.exports = function (ourDb, theirDb, count, data) {
	function callback0() {
		global.gc();
		ourTest(ourDb, count, data, callback1);
	}
	function callback1() {
		global.gc();
		theirTest(theirDb, count, data, callback2);
	}
	function callback2() {
		ourDb.close();
		theirDb.close(process.exit);
	}
	setTimeout(callback0, 100);
};

exports.data = undefined;

function ourTest(db, count, data, done) {
	data = {data: data};
	var statements = new Array(count).fill('INSERT INTO entries VALUES (@data);');
	
	var t0 = process.hrtime();
	exports.data = db.transaction(statements).run(data);
	var td = process.hrtime(t0);
	
	report('better-sqlite3', count, td);
	done();
}
function theirTest(db, count, data, done) {
	data = {'@data': data};
	function run() {
		db.run('BEGIN TRANSACTION;', checkForError);
		for (var i=0; i<count; ++i) {
			db.run('INSERT INTO entries VALUES (@data);', data, checkForError);
		}
		db.run('COMMIT TRANSACTION;', callback);
	}
	function checkForError(err) {
		if (err) {throw err;}
	}
	var t0 = process.hrtime();
	db.serialize(run);
	function callback(err) {
		exports.data = this;
		checkForError(err);
		var td = process.hrtime(t0);
		report('node-sqlite3', count, td);
		done();
	}
}

function report(name, count, time) {
	var ms = time[0] * 1000 + Math.round(time[1] / 1000000);
	console.log(name + '\t' + count + ' INSERTs (single TRANSACTION) in ' + ms + 'ms');
}
