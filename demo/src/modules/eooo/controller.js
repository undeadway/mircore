const { controller, actions } = mircore;
const { baseAction } = actions;
const { HttpRequestMethod } = JsConst;

function indexAction() {
	const action = baseAction();

	action.execute = () => {
		/**
		 * 这里是故意写错，可以让 micore 跳转到错误页面
		 */
		throw new Error(new Date().toString);
	};

	return action;
}

function indexController() {

	const ctrler = controller();

	ctrler.addAction({ action: indexAction, method: HttpRequestMethod.GET });

	return ctrler;
}

module.exports = exports = indexController;