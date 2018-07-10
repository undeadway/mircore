let commonAction = require(pathResolve("/src/common/common_action"));

function indexAction() {
	var action = commonAction();

	action.query = () => {

		let ctrler = action.controller;
		ctrler.setAttr("linkVal", "index");
		ctrler.setAttr("linkTtl", "Index page");
	};

	return action;
}

module.exports = indexAction;
