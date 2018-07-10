let commonAction = require(pathResolve("/src/common/common_action"));

function indexAction() {
	var action = commonAction();

	action.query = () => {

		let ctrler = action.controller;
		ctrler.setAttr("linkVal", "next");
		ctrler.setAttr("linkTtl", "Next page");
		ctrler.setAttr("errLinkVal", "notexist");
		ctrler.setAttr("errLinkTtl", "notexist page");
		ctrler.setAttr("isIndex",()=> {
			return true;
		});
	};

	return action;
}

module.exports = indexAction;
