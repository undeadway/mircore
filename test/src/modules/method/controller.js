const controller = mircore.controller;
const baseAction = mircore.baseAction;
const { split } = mircore.config;
const { HttpRequestMethod } = Coralian.constants;
const PAGE = "/res/html/method.html"

function getAction() {
	const action = baseAction();

	action.execute = () => {

		const ctrler = action.controller;

		let param = ctrler.getParas();
		if (Array.isEmpty(param)) {
			param.push("-");
		}
		ctrler.setAttr("requestUrl", param.join(split));

		console.log();
		ctrler.setAttr("requestMethod", ctrler.method());

		ctrler.render(PAGE);
	};

	return action;
}

function indexController() {

	const ctrler = controller();

	ctrler.addAction("index", getAction, HttpRequestMethod.GET);
	ctrler.addAction("index", getAction, HttpRequestMethod.POST);
	ctrler.addAction("index", getAction, HttpRequestMethod.PUT);
	ctrler.addAction("index", getAction, HttpRequestMethod.DELETE);

	return ctrler;
}

module.exports = exports = indexController;