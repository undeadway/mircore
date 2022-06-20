/**
 * 开放给外部的辅助功能
 */
const process = require("child_process");
const nodemailer = require("nodemailer");

const { getConfig } = require("./app-config");

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

const mailConfig = getConfig("mail");
const hasMainConfig = !!mailConfig;


exports.mail = ({targets, subject, html, success, failed}) => {

	if (!hasMainConfig) {
		throw new Error("没有配置邮箱");
	}

	const transporter = (hasMainConfig) ? nodemailer.createTransport(mailConfig) : null;

	transporter.sendMail({
		from: mailConfig.auth.user,
		to: trgt.join(),
		subject: subject,
		html: html
	}, function (err, res) {
		if (err) {
			Coralian.logger.err("邮件发送失败");
			success(err);
		} else {
			Coralian.logger.log("邮件发送成功");
			failed(res);
		}
	});
};