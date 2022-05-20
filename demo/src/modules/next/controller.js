const { controller, actions } = mircore;
const { baseAction } = actions;
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

	ctrler.addAction({ action: indexAction, method: HttpRequestMethod.GET });

	return ctrler;
}

module.exports = exports = nextController;