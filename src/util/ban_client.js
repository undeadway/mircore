let clients = require("../config/app").getConfig("ban-client");

module.exports = function(input) {

	input = input.toLowerCase();
	if (!clients || clients.isEmpty()) return false;

	for(let i = 0, len = clients.length; i < len; i++) {
		let client = clients[i];
		if(input === client || input.contains(clients[i])) {
			Eureka.logger.log(`Client ${input} has banned.`);
			return true;
		};
	}

	return false;
}
