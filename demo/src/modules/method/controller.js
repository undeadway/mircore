const { controller, actions } = mircore;
const { baseAction, ajaxAction } = actions;
const { splitMark } = mircore.config;
const { HttpRequestMethod } = Coralian.constants;
const PAGE = "/res/html/method.html"

function indexAction() {
	const action = baseAction();

	action.execute = () => {

		const ctrler = action.controller;
		ctrler.render({url: PAGE});
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

		action.renderAjax({
			"requestUrl": param.join(splitMark),
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

		action.renderAjax({
			"requestUrl": param.join(";"),
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

		action.renderAjax({
			"requestUrl": param.join("-"),
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

		action.renderAjax({
			"requestUrl": param.join(),
			"requestMethod": ctrler.method(),
			"requestParams": JSON.stringify(querys)
		});
	};

	return action;
}

function methodController() {

	const ctrler = controller();

	ctrler.addAction(indexAction);
	ctrler.addAction("testreq", getAction, HttpRequestMethod.GET);
	ctrler.addAction("testreq", postAction, HttpRequestMethod.POST);
	ctrler.addAction("testreq", putAction, HttpRequestMethod.PUT);
	ctrler.addAction("testreq", deleteAction, HttpRequestMethod.DELETE);

	return ctrler;
}

module.exports = exports = methodController;