const controller = mircore.controller;

function indexController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		ctrler.render("No No No!");
	});

	return ctrler;
}

module.exports = exports = indexController;