'use strict';
require('../get-db')('select-small', function (ourDb, theirDb) {
	require('../types/select-all')(ourDb, theirDb, 100, 1000, 'nul');
});
