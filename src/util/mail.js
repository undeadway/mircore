const nodemailer = require("nodemailer");
const config = require("../config/app").getConfig("mail");

let transporter = nodemailer.createTransport(config);

function sendMail(trgt, subject, html, callback) {

	transporter.sendMail({
		from : config.auth.user,
		to : trgt.join(),
		subject : subject,
		html : html
	}, function(err, res) {
		if (err) {
			Eureka.logger.err("Mail sent error.");
			callback(err);
		} else {
			callback(res);
		}	
	});
}

module.exports = sendMail;
