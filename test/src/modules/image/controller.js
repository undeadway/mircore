const { controller, file } = mircore;
const file_name = "res/file/ttplayer-logo.png";

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {

		let f = file.create("/home/waygc/workspace/mircore/test/" + file_name);

		ctrler.renderFile(f);
	});

	return ctrler;
}

module.exports = exports = nonoController;