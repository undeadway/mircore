const { controller, file } = mircore;
const file_name_svg = "/home/waygc/workspace/mircore/demo/res/file/mylogo.svg";
const file_name_png = "/home/waygc/workspace/mircore/demo/res/file/mylogo.png";

function nonoController() {

	const ctrler = controller();

	ctrler.addAction({ name: "svg", action: () => {

		ctrler.renderFile(file_name_svg);
	} });
	ctrler.addAction({ name: "png", action: () => {

		ctrler.renderFile(file_name_png);
	} });


	return ctrler;
}

module.exports = exports = nonoController;