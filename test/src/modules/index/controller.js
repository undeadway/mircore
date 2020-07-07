const controller = require("./../../../../src/core/controller");
const { baseAction } = require("./../../../../src/core/actions");
const { HttpRequestMethod } = Coralian.constants;
const PAGE = "/res/html/page.html"

function indexAction() {
	const action = baseAction();

	action.execute = () => {
		const ctrler = action.controller;
		ctrler.render(PAGE);
	};

	return action;
}

function indexController() {

	const ctrler = controller();

	ctrler.addAction(indexAction, HttpRequestMethod.GET);

	return ctrler;
}

module.exports = exports = indexController;