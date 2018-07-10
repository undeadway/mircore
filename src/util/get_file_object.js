
var statuses = {}, fileObjects = {}, fs = require("fs");

module.exports = function(fn) {

	var status = fs.statSync(fn), result;

	if (!equals(status, statuses[fn])) {
		statuses[fn] = status;
		fileObjects[fn] = result = fs.readFileSync(fn, "utf-8");
	} else {
		result = fileObjects[fn];
	}

	return result;

};