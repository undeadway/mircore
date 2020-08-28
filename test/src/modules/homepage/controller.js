const { controller, baseAction } = mircore;
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

		ctrler.render({url: PAGE});
	};

	return action;
}

function indexController() {

	const ctrler = controller();

	ctrler.addAction(indexAction, HttpRequestMethod.GET);

	return ctrler;
}

module.exports = exports = indexController;