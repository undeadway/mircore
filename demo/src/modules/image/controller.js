const { controller, file } = mircore;
const path = require("path");
const file_name_svg = "./res/file/mylogo.svg";
const file_name_png =  "./res/file/mylogo.png";

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