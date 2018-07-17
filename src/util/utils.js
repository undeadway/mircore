/*
 * mircore 的工具库
 * 其中 externs 是外部可使用，privates是只供 mircore 自己使用
 */
let externs = {}, privates = {};

const process = require('child_process');
const nodemailer = require("nodemailer");
const fs = require("fs");

const getConfig = require("../config/app").getConfig;

//////////////////////////// exports ////////////////////////////
let stdOutFile = pathResolve("/logs/std-out");

exports.runShell = (shellCmd) => {
    Coralian.logger.log(`run ${shellCmd} start.`);
    process.exec(shellCmd, (err, stdout, stderr) => {
      if (err) {
        fs.writeFileSync(pathResolve("/logs/err"), err);
        fs.writeFileSync(pathResolve("/logs/str-err"), stderr);
      } else {
        fs.writeFileSync(stdOutFile, stdout);
      }
        Coralian.logger.log(`run ${shellCmd} end.`);
    });
}

const mailConfig = getConfig("mail");
let transporter = nodemailer.createTransport(mailConfig);

function sendMail(trgt, subject, html, callback) {

	transporter.sendMail({
		from : mailConfig.auth.user,
		to : trgt.join(),
		subject : subject,
		html : html
	}, function(err, res) {
		if (err) {
			Coralian.logger.err("Mail sent failed.");
			callback(err);
		} else {
			Coralian.logger.err("Mail sent succeeed.");
			callback(res);
		}	
	});
}

exports.mail = sendMail;

var statuses = {}, fileObjects = {};

exports.getFileObject = function(fn) {

	var status = fs.statSync(fn), result;

	if (!equals(status, statuses[fn])) {
		statuses[fn] = status;
		fileObjects[fn] = result = fs.readFileSync(fn, "utf-8");
	} else {
		result = fileObjects[fn];
	}

	return result;

};
//////////////////////////// exports ////////////////////////////
//////////////////////////// privates ////////////////////////////

var GLOBAL_INSPECTOR_FOLDER = pathResolve("/src/inspector/global", true);
var SYSTEM_INSPECTOR_FOLDER = "../inspectors";

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

privates.getGlobalInspectors = () => {

	return INSPECOTRS;
};

let clients = getConfig("limited-clients");

privates.clientDisAccessable = function(input) {

	input = input.toLowerCase();
	let reject = clients.reject;
	if (!reject || reject.isEmpty()) return false;
	for(let i = 0, len = reject.length; i < len; i++) {
		let client = reject[i];
		if(input === client || input.contains(clients[i])) {
			Coralian.logger.log(`Client ${input} has banned.`);
			return true;
		}
	}

	let allow = clients.allow;
	if (!allow || allow.isEmpty()) return false;
	for(let i = 0, len = allow.length; i < len; i++) {
		let client = allow[i];
		if(input === client || input.contains(clients[i])) {
			return false;
		}
	}

	Coralian.logger.log(`Client ${input} has banned.`);
	return true;
};
//////////////////////////// privates ////////////////////////////

module.exports = exports = {
    externs : externs, privates : privates
};
