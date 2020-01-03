/*
 * mircore 的工具库
 * 其中 publics 是外部可使用，privates是只供 mircore 自己使用
 */
const publics = {}, privates = {};
const statuses = {}, fileObjects = {};
const constants = {};
const process = require('child_process');
const nodemailer = require("nodemailer");
const fs = require("fs");
const getConfig = require("../config/app").getConfig;

//////////////////////////// publics ////////////////////////////
publics.runShell = (shellCmd) => {
	Coralian.logger.log(`run ${shellCmd} start.`);
	process.exec(shellCmd, (err, stdout, stderr) => {
		if (err) {
			Coralian.logger.err(err);
			Coralian.logger.err(stderr);
		} else {
			Coralian.logger.log(stdout);
		}
		Coralian.logger.log(`run ${shellCmd} end.`);
	});
}

publics.mail = () => {

	let mailConfig = getConfig("mail");
	let hasMainConfig = !!mailConfig;
	let transporter = (hasMainConfig) ? nodemailer.createTransport(mailConfig) : null;

	return (trgt, subject, html, callback) => {

		if (!hasMainConfig) return;

		transporter.sendMail({
			from: mailConfig.auth.user,
			to: trgt.join(),
			subject: subject,
			html: html
		}, function (err, res) {
			if (err) {
				Coralian.logger.err("Mail sent failed.");
				callback(err);
			} else {
				Coralian.logger.err("Mail sent succeeed.");
				callback(res);
			}
		});
	}
};

publics.getFileObject = function (fn) {

	let status = fs.statSync(fn), result;

	if (!Object.equals(status, statuses[fn])) {
		statuses[fn] = status;
		fileObjects[fn] = result = fs.readFileSync(fn, "utf-8");
	} else {
		result = fileObjects[fn];
	}

	return result;
};

Object.defineProperty(constants, 'AjaxRenderType', {
	value: {
		//File : 'File',
		JSON: 'JSON'
	},
	writeable: false
});

Object.defineProperty(publics, 'constants', {
	value: constants,
	writeable: false
});

//////////////////////////// publics ////////////////////////////
//////////////////////////// privates ////////////////////////////

const clients = getConfig("limited-clients");
const GLOBAL_INSPECTOR_FOLDER = pathResolve("/src/inspector/global", true);
const SYSTEM_INSPECTOR_FOLDER = "../inspectors";
const INSPECOTRS = [];

privates.getGlobalInspectors = () => {

	if (Array.isEmpty(INSPECOTRS)) {
		if (fs.existsSync(GLOBAL_INSPECTOR_FOLDER)) {
			let globalInspectors = fs.readdirSync(GLOBAL_INSPECTOR_FOLDER);
			for (let i = 0, len = globalInspectors.length; i < len; i++) {
				INSPECOTRS.push(require(GLOBAL_INSPECTOR_FOLDER + globalInspectors[i]));
			}
		}
		if (fs.existsSync(SYSTEM_INSPECTOR_FOLDER)) {
			let systemInspecotrs = fs.readdirSync(SYSTEM_INSPECTOR_FOLDER);
			for (let i = 0, len = systemInspecotrs.length; i < len; i++) {
				INSPECOTRS.push(require(SYSTEM_INSPECTOR_FOLDER + systemInspecotrs[i]));
			}
		}
	}

	return INSPECOTRS;
};

privates.clientDisAccessable = function (input) {

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
//////////////////////////// privates ////////////////////////////

module.exports = exports = {
	publics, privates
};
