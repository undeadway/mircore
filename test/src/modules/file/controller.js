const file = require("../../../../src/components/file");

const controller = mircore.controller;

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		let file = ctrler.getFile("data1");
		file.saveTo("/home/waygc/temp/", file.getFileName());
		ctrler.renderFile({file: file.getBinaryData()});
	}, "post");

	return ctrler;
}

module.exports = exports = nonoController;