let server = require("proton");

server.requireConfigs([
						"/lib/util/Eureka!"
					]);
server.start();
