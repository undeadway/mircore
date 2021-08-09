const { controller, file } = mircore;
const file_name = "res/file/ttplayer-logo.png";

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {

		file.create("/home/waygc/workspace/mircore/test/" + file_name);

		ctrler.renderFile({file: file_name});
	});

	return ctrler;
}

module.exports = exports = nonoController;