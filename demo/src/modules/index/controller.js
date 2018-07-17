let base = require("mircore").controller;

function indexController() {
	let ctrler = base();

	ctrler.addAction(require("./index_action"));

	return ctrler;
}

module.exports = exports = indexController;
