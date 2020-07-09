const controller = require("./../../../../src/core/controller");
const { baseAction } = require("./../../../../src/core/actions");
const { getLink } = require("./../../util/util");
const { HttpRequestMethod } = Coralian.constants;
const PAGE = "/res/html/method.html"

function indexAction() {
	const action = baseAction();

	action.execute = () => {

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