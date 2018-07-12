let clients = require("../config/app").getConfig("limited-clients");

module.exports.disAccessable = function(input) {

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
