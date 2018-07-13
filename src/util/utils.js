let that = module.exports = exports = {};

const process = require('child_process');
const nodemailer = require("nodemailer");
const fs = require("fs");

const getConfig = require("../config/app").getConfig;

let stdOutFile = pathResolve("/logs/std-out");

that.runShell = (shellCmd) => {
    Eureka.logger.log(`run ${shellCmd} start.`);
    process.exec(shellCmd, (err, stdout, stderr) => {
      if (err) {
        fs.writeFileSync(pathResolve("/logs/err"), err);
        fs.writeFileSync(pathResolve("/logs/str-err"), stderr);
      } else {
        fs.writeFileSync(stdOutFile, stdout);
      }
        Eureka.logger.log(`run ${shellCmd} end.`);
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
			Eureka.logger.err("Mail sent failed.");
			callback(err);
		} else {
			Eureka.logger.err("Mail sent succeeed.");
			callback(res);
		}	
	});
}

that.mail = sendMail;

let clients = getConfig("limited-clients");

that.clientDisAccessable = function(input) {

	input = input.toLowerCase();
	let reject = clients.reject;
	if (!reject || reject.isEmpty()) return false;
	for(let i = 0, len = reject.length; i < len; i++) {
		let client = reject[i];
		if(input === client || input.contains(clients[i])) {
			Eureka.logger.log(`Client ${input} has banned.`);
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

	Eureka.logger.log(`Client ${input} has banned.`);
	return true;
}


var statuses = {}, fileObjects = {};

that.getFileObject = function(fn) {

	var status = fs.statSync(fn), result;

	if (!equals(status, statuses[fn])) {
		statuses[fn] = status;
		fileObjects[fn] = result = fs.readFileSync(fn, "utf-8");
	} else {
		result = fileObjects[fn];
	}

	return result;

};
