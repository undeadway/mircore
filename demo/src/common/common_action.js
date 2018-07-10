let baseAction = require("proton").baseAction;
let config = require(pathResolve("/src/config/siteapp"));
let TEMPLATE_HTML = "/res/html/template.html";

function commonAction() {
	var action = baseAction();

	action.execute = () => {

		action.query();
		let ctrler = action.controller;

		ctrler.setAttr("pageName", action.getRequestRoute());
		ctrler.setAttr("sitename", config.getConfig("name"));
		ctrler.render(TEMPLATE_HTML);
	};

	return action;
}

module.exports = commonAction;
