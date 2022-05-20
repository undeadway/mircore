const { controller, file } = mircore;
const file_name = "/home/waygc/workspace/mircore/demo/res/file/not-exist.png";

function nonoController() {

	const ctrler = controller();

	ctrler.addAction({ action: () => {

		ctrler.renderFile(file_name);
	} });

	return ctrler;
}

module.exports = exports = nonoController;