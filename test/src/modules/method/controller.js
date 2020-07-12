const controller = require("./../../../../src/core/controller");
const { baseAction } = require("./../../../../src/core/actions");
const { getLink } = require("./../../util/util");
const { HttpRequestMethod } = Coralian.constants;
const PAGE = "/res/html/method.html"

function getAction() {
	const action = baseAction();

	action.execute = () => {

		const ctrler = action.controller;

		let param = ctrler.getQuery("param");
		ctrler.setAttr("param", param);

		ctrler.render(PAGE);
	};

	return action;
}

function postAction() {

}

function putAction() {

}

function deleteAction () {

}

function indexController() {

	const ctrler = controller();

	ctrler.addAction("index", getAction, HttpRequestMethod.GET);
	ctrler.addAction("index", postAction, HttpRequestMethod.POST);
	ctrler.addAction("index", putAction, HttpRequestMethod.PUT);
	ctrler.addAction("index", deleteAction, HttpRequestMethod.DELETE);

	return ctrler;
}

module.exports = exports = indexController;