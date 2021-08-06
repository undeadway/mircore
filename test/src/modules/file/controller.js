const controller = mircore.controller;

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		ctrler.end();
	}, "post");

	return ctrler;
}

module.exports = exports = nonoController;