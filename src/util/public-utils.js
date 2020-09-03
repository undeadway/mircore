
const process = require('child_process');
const nodemailer = require("nodemailer");

const { getConfig } = require("../util/app-config");
const constants = {};

exports.runShell = (shellCmd) => {
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

exports.mail = () => {

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

// publics.getFileObject = function (fn) {

// 	let status = fs.statSync(fn), result;

// 	if (!Object.equals(status, statuses[fn])) {
// 		statuses[fn] = status;
// 		fileObjects[fn] = result = fs.readFileSync(fn, "utf-8");
// 	} else {
// 		result = fileObjects[fn];
// 	}

// 	return result;
// };

Object.defineProperty(constants, 'AjaxRenderType', {
	value: {
		//File : 'File',
		JSON: 'JSON'
	},
	writeable: false
});

Object.defineProperty(exports, 'constants', {
	value: constants,
	writeable: false
});