let base = require("proton").controller;
let ANOTHER_PAGE = "/res/html/another.html";

function indexController() {
	let ctrler = base();

	ctrler.addAction("another", () => {
		ctrler.render(ANOTHER_PAGE);
	});
	ctrler.addAction(require("./index_action"));

	return ctrler;
}

module.exports = exports = indexController;
