const { controller, baseAction, ajaxAction } = mircore;
const { split } = mircore.config;
const { HttpRequestMethod } = Coralian.constants;
const PAGE = "/res/html/method.html"

function indexAction() {
	const action = baseAction();

	action.execute = () => {

		const ctrler = action.controller;
		ctrler.render(PAGE);
	};

	return action;
}

function getAction() {
	const action = ajaxAction();

	action.query = () => {

		const ctrler = action.controller;

		let param = ctrler.getParas();
		if (Array.isEmpty(param)) {
			param.push("-");
		}

		let querys = ctrler.getQueries();

		ctrler.renderJSON({
			"requestUrl": param.join(split),
			"requestMethod": ctrler.method(),
			"requestParams": JSON.stringify(querys)
		});
	};

	return action;
}

function postAction() {
	const action = ajaxAction();

	action.query = () => {

		const ctrler = action.controller;

		let param = ctrler.getParas();
		if (Array.isEmpty(param)) {
			param.push("-");
		}

		let querys = ctrler.getQueries();

		ctrler.renderJSON({
			"requestUrl": param.join(split),
			"requestMethod": ctrler.method(),
			"requestParams": JSON.stringify(querys)
		});
	};

	return action;
}

function putAction() {
	const action = ajaxAction();

	action.query = () => {

		const ctrler = action.controller;

		let param = ctrler.getParas();
		if (Array.isEmpty(param)) {
			param.push("-");
		}

		let querys = ctrler.getQueries();

		ctrler.renderJSON({
			"requestUrl": param.join(split),
			"requestMethod": ctrler.method(),
			"requestParams": JSON.stringify(querys)
		});
	};

	return action;
}

function deleteAction() {
	const action = ajaxAction();

	action.query = () => {

		const ctrler = action.controller;

		let param = ctrler.getParas();
		if (Array.isEmpty(param)) {
			param.push("-");
		}

		let querys = ctrler.getQueries();

		ctrler.renderJSON({
			"requestUrl": param.join(split),
			"requestMethod": ctrler.method(),
			"requestParams": JSON.stringify(querys)
		});
	};

	return action;
}

function indexController() {

	const ctrler = controller();

	ctrler.addAction(indexAction);
	ctrler.addAction("testreq", getAction, HttpRequestMethod.GET);
	ctrler.addAction("testreq", postAction, HttpRequestMethod.POST);
	ctrler.addAction("testreq", putAction, HttpRequestMethod.PUT);
	ctrler.addAction("testreq", deleteAction, HttpRequestMethod.DELETE);

	return ctrler;
}

module.exports = exports = indexController;