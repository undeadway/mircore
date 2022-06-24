/**
 * 开放给外部的辅助功能
 */
const process = require("child_process");

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