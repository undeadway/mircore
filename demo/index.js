let server = require("proton");

server.requireConfigs([
						"/lib/util/Coralian!"
					]);
server.start();
