const { controller, file } = mircore;
const file_name = "/home/waygc/workspace/mircore/test/res/file/ttplayer-logo.png";

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {

		let f = file.create(file_name);

		ctrler.renderFile(f);
	});

	return ctrler;
}

module.exports = exports = nonoController;