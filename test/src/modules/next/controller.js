const controller = require("./../../../../src/core/controller");
const { baseAction } = require("./../../../../src/server/actions");
const { getLink } = require("./../../util/util");
const { HttpRequestMethod } = Coralian.constants;
const PAGE = "/res/html/page.html"

function indexAction() {
	const action = baseAction();

	action.execute = () => {
		const ctrler = action.controller;
		ctrler.setAttr("now", new Date().toString());
		ctrler.setAttr("name", ctrler.getReqRoute());
		ctrler.setAttr("link", getLink());

		ctrler.render({url: PAGE});
	};

	return action;
}

function nextController() {

	const ctrler = controller();

	ctrler.addAction(indexAction, HttpRequestMethod.GET);

	return ctrler;
}

module.exports = exports = nextController;