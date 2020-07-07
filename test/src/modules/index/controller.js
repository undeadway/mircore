const controller = require("./../../../../src/core/controller");
const { baseAction } = require("./../../../../src/core/actions");
const { getLink } = require("./../../util/util");
const { HttpRequestMethod } = Coralian.constants;
const PAGE = "/res/html/page.html"

function indexAction() {
	const action = baseAction();

	action.execute = () => {
		const ctrler = action.controller;
		ctrler.setAttr("now", new Date().getTime());
		ctrler.setAttr("name", ctrler.getModName());
		ctrler.setAttr("link", getLink());

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