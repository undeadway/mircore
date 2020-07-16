const controller = mircore.controller;

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		ctrler.render("No No No!");
	});

	return ctrler;
}

module.exports = exports = nonoController;