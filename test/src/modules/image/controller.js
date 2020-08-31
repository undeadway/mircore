const controller = mircore.controller;
const file = "/res/file/ttplayer-logo.png";

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		ctrler.renderFile({file: file});
	});

	return ctrler;
}

module.exports = exports = nonoController;