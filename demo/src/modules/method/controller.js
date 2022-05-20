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

	ctrler.addAction({ action: indexAction });
	ctrler.addAction({ name: "testreq", action: getAction, method: HttpRequestMethod.GET });
	ctrler.addAction({ name: "testreq", action: postAction, method: HttpRequestMethod.POST });
	ctrler.addAction({ name: "testreq", action: putAction, method: HttpRequestMethod.PUT });
	ctrler.addAction({ name: "testreq", action: deleteAction, method: HttpRequestMethod.DELETE });

	return ctrler;
}

module.exports = exports = methodController;