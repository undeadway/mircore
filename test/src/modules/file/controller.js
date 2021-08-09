const { controller, file } = mircore;
const fs = require("fs");

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {

		let fd = ctrler.getFile("data1");

		fd.save("/home/waygc/temp/", fd.getFileName());
		ctrler.renderFile(fd);
	}, "post");

	return ctrler;
}

module.exports = exports = nonoController;