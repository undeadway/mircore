let base = require("proton").controller;

function indexController() {
	let ctrler = base();

	ctrler.addAction(() => {
		ctrler.render(ANOTHER_PAGE);
	});
	ctrler.addAction(require("./index_action"));

	return ctrler;
}

module.exports = exports = indexController;
