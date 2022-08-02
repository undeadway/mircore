const { controller, file } = mircore;
const file_name_svg = "./res/file/mylogo.svg";
const file_name_png =  "./res/file/mylogo.png";
const file_name_text =  "./res/file/mytext.txt";

function nonoController() {

	const ctrler = controller();

	ctrler.addAction({ name: "svg", action: () => {

		ctrler.renderFile(file_name_svg);
	} });
	ctrler.addAction({ name: "png", action: () => {

		ctrler.renderFile(file_name_png);
	} });
	ctrler.addAction({ name: "txt", action: () => {

		ctrler.renderFile(file_name_text, true);
	} });


	return ctrler;
}

module.exports = exports = nonoController;