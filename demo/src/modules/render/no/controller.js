const { controller, file } = mircore;
const path = require("path");
const file_name = path.resolve(__dirname, "./res/file/not-exist.png");

function nonoController() {

	const ctrler = controller();

	ctrler.addAction({ action: () => {

		ctrler.renderFile(file_name);
	} });

	return ctrler;
}

module.exports = exports = nonoController;