
var GLOBAL_INSPECTOR_FOLDER = pathResolve("/src/inspector/global", true);
var SYSTEM_INSPECTOR_FOLDER = "../inspectors";
var fs = require("fs");

var INSPECOTRS = [];

if (INSPECOTRS.isEmpty()) {
	if (fs.existsSync(GLOBAL_INSPECTOR_FOLDER)) {
		var globalInspectors = fs.readdirSync(GLOBAL_INSPECTOR_FOLDER);
		for ( let i = 0, len = globalInspectors.length; i < len; i++) {
			INSPECOTRS.push(require(GLOBAL_INSPECTOR_FOLDER + globalInspectors[i]));
		}
	}
	if (fs.existsSync(SYSTEM_INSPECTOR_FOLDER)) {
		var systemInspecotrs = fs.readdirSync(SYSTEM_INSPECTOR_FOLDER);
		for (let i = 0, len = systemInspecotrs.length; i < len; i++) {
			INSPECOTRS.push(require(SYSTEM_INSPECTOR_FOLDER + systemInspecotrs[i]));
		}
	}
}

function getGlobalInspectors() {

	return INSPECOTRS;
}

module.exports = getGlobalInspectors;