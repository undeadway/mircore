const { controller, baseAction } = mircore;
const { HttpRequestMethod } = Coralian.constants;

let index = 0;

function indexAction() {
	const action = baseAction();

	action.execute = () => {
		const ctrler = action.controller;
		ctrler.render(ctrler.getReqPath());
	};

	return action;
}

function indexController() {

	const ctrler = controller();

	ctrler.addAction(indexAction, HttpRequestMethod.GET);

	return ctrler;
}

module.exports = exports = indexController;