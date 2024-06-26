const { controller, actions } = mircore;
const { baseAction } = actions;
const { HttpRequestMethod } = JsConst;

function indexAction() {
	const action = baseAction();

	action.execute = () => {
		const ctrler = action.controller;
		ctrler.render({url: ctrler.getReqPath()});
	};

	return action;
}

function indexController() {

	const ctrler = controller();

	ctrler.addAction({ action: indexAction, method: HttpRequestMethod.GET });

	return ctrler;
}

module.exports = exports = indexController;