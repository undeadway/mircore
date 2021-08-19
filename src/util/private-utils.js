/**
 * 只供 mircore 内部使用的辅助功能
 */
const file = require("./../components/public/file");
const { getConfig } = require("../util/app-config");

const clients = getConfig("limited-clients") || {};
const GLOBAL_INSPECTOR_FOLDER = pathResolve("/src/inspector/global", true);
const SYSTEM_INSPECTOR_FOLDER = "../inspectors";
const INSPECOTRS = [];

exports.getGlobalInspectors = () => {

	if (Array.isEmpty(INSPECOTRS)) {
		if (file.canAccess(GLOBAL_INSPECTOR_FOLDER)) {
			let globalInspectors = fs.readdirSync(GLOBAL_INSPECTOR_FOLDER);
			for (let i = 0, len = globalInspectors.length; i < len; i++) {
				INSPECOTRS.push(require(GLOBAL_INSPECTOR_FOLDER + globalInspectors[i]));
			}
		}
		if (file.canAccess(SYSTEM_INSPECTOR_FOLDER)) {
			let systemInspecotrs = fs.readdirSync(SYSTEM_INSPECTOR_FOLDER);
			for (let i = 0, len = systemInspecotrs.length; i < len; i++) {
				INSPECOTRS.push(require(SYSTEM_INSPECTOR_FOLDER + systemInspecotrs[i]));
			}
		}
	}

	return INSPECOTRS;
};

exports.clientDisAccessable = function (input) {

	input = input.toLowerCase();
	let reject = clients.reject;
	if (!reject || Array.isEmpty(reject)) return false;
	for (let i = 0, len = reject.length; i < len; i++) {
		let client = reject[i];
		if (input === client || String.contains(input, clients[i])) {
			Coralian.logger.log(`Client ${input} has banned.`);
			return true;
		}
	}

	let allow = clients.allow;
	if (!allow || Array.isEmpty(allow)) return false;
	for (let i = 0, len = allow.length; i < len; i++) {
		let client = allow[i];
		if (input === client || String.contains(input, clients[i])) {
			return false;
		}
	}

	Coralian.logger.log(`Client ${input} has banned.`);
	return true;
};