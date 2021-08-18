const { controller, file } = mircore;
const file_name_svg = "/home/waygc/workspace/mircore/demo/res/file/mylogo.svg";
const file_name_png = "/home/waygc/workspace/mircore/demo/res/file/mylogo.png";

function nonoController() {

	const ctrler = controller();

	ctrler.addAction("svg", () => {

		ctrler.renderFile(file_name_svg);
	});
	ctrler.addAction("png", () => {

		ctrler.renderFile(file_name_png);
	});


	return ctrler;
}

module.exports = exports = nonoController;