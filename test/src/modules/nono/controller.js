const controller = mircore.controller;

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		ctrler.render({url: "No No No!"});
	});

	return ctrler;
}

module.exports = exports = nonoController;