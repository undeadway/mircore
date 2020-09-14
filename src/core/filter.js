/**
 * 路径过滤器
 * 通过请求路径和文件夹路径来查找是否是合法的路径。
 * 如果是已注册的路径（可用模块），
 * 则返回请求该路径所对应的controller，否则返回 404 。
 */

const fs = require("fs");
const { routes } = require("../util/app-config");
const { getGlobalInspectors } = require("../util/private-utils");
const CONTROLLER_MAPPING = require("./../util/controller-mapping");
const { Mark } = Coralian.constants;
const { errorCast } = Error;
const QUESTION_REP_MARK = "{?}", JS_FILE_EXT =  ".js";
const CONTROLLER_PATH = pathResolve(`/src/modules${QUESTION_REP_MARK}/controller`);
const STR_ROUTE_INDEX = '/index';

function getController(req, route) {

	let ctrlerWrapper, name = route;

	if (name === Mark.SLASH) {
		name = STR_ROUTE_INDEX;
	}

	name = name.split(Mark.SLASH);
	name.shift();
	let count = name.length - 1;

	if (count > 0 && String.isEmpty(name[count])) {
		name.pop();
	}

	for (; count >= 0; count--) {

		let ctrlerName = routes.get(Mark.SLASH + name.join(Mark.SLASH));

		if (ctrlerName === undefined) { // 非已注册的路径则判断非法路径，不做请求处理，进入下一轮循环
			name.pop();
		} else {
			ctrlerWrapper = getControllerWrapper(ctrlerName);
			if (ctrlerWrapper !== null) {
				return ctrlerWrapper;
			}

			name.pop();
		}
	}

	if (!ctrlerWrapper && count === 0) {
		return CONTROLLER_MAPPING.put(STR_ROUTE_INDEX, require(CONTROLLER_PATH.replace(QUESTION_REP_MARK, STR_ROUTE_INDEX)));
	} else if (routes.hasFuzzyMatching()) {
		let ctrlerName = routes.get(`${Mark.SLASH}${Mark.ASTERISK}`);
		ctrlerWrapper = getControllerWrapper(ctrlerName);
		return ctrlerWrapper;
	}
	req.parse.error = 404;
	return CONTROLLER_MAPPING.error();
}

function getControllerWrapper (ctrlerName, callback) {
	let ctrlerWrapper = CONTROLLER_MAPPING.get(ctrlerName);
	if (ctrlerWrapper) {
		return ctrlerWrapper;
	}
	let ctrlerPath = CONTROLLER_PATH.replace(QUESTION_REP_MARK, ctrlerName);
	if (fs.existsSync(ctrlerPath + JS_FILE_EXT)) {
		return CONTROLLER_MAPPING.put(ctrlerName, require(ctrlerPath));
	}

	return null;
}

function invokeController(req, res, route) {

	try {
		let ctrler = getController(req, route);
		let instance = ctrler.instance();

		/*
		 * 在 controller 中判断是否正常执行
		 * 在 Controller 得到是否正常执行判断后进行后续操作
		 * 在正常执行时，需要先执行 Global 级的 inspector 再执行 Filter 级的 inspector
		 * 非正常执行时，直接在 Controller 中 调用错误处理，所以在 filter 中不用做额外处理
		 */
		// 全局 inspector 的执行
		invokeGlobalInspectors({ instance, name: ctrler.name }, req, res, getFilterInvocation({ instance, inspectors: ctrler.inspectors }, req, res));
	} catch (e) {
		e.code = Coralian.constants.HttpStatusCode.INTERNAL_SERVER_ERROR;
		Coralian.logger.err(e);
		req.parse.error = e;
		let errorControllerWapper = CONTROLLER_MAPPING.error();;
		let exe = errorControllerWapper.instance();
		if (exe.judgeExecute(req, res, errorControllerWapper.name)) {
			exe.execute();
		}
	}
}

function invokeGlobalInspectors({ instance, name }, req, res, fi) {

	let inspectors = getGlobalInspectors();
	let count = inspectors.length,
		index = 0;

	function end() {
		index = count + 1;
	}

	// 因为 所有的 inspector 都要用得到 controller 所以将 GlobalInvocation 放在这里实现
	({ // GlobalInvocation
		getController: function () {
			return instance;
		},
		execute: function () {
			if (index < count) {
				inspectors[index++].inspect(this);
			} else if (index++ === count) {
				if (instance.judgeExecute(req, res, name)) {
					fi.execute(); // 当 global  inspector 被执行完时，执行 filter inspector
				}
				end();
			}
		},
		end: end
	}).execute();
}

function getFilterInvocation({ instance, inspectors }, req, res) {

	let count = inspectors.length,
		index = 0;

	function end() {
		index = count + 1;
	}

	let fi = { // 这里的对象就是 ControllerInvocation
		execute: function () {
			if (index < count) {
				inspectors[index++].inspect(this); // 执行递归，进行下一轮检查
			} else if (index++ === count) {
				instance.execute(); // 当inspector 被执行完时，执行 controller
				end();
			}
		},
		redirect: instance.redirect,
		getController: function () {
			return instance;
		},
		/* 
		 * 当目标请求的 controller 被逻辑拒绝的时候，
		 * 调用这个方法来更替 controller 以及执行后续操作
		 */
		resetController: function (rename) {
			if ('string' !== typeof rename) {
				errorCast(rename, String);
			}
			index = count + 1;
			// 递归调用 invokeController 来获取 Controller
			invokeController(req, res, rename);
			end();
		},
		// 强制结束 ci 递归调用的函数
		end: end
	};

	return fi;
}

function filter(req, res) {

	invokeController(req, res, req.parse.pathname);
}

// TODO 对 controller 的动态更替，现在不考虑
//	filter.addController = function(name) {
//		addController(name);
//	};
//	filter.removeController = function(name) {
//		delete mapping[name];
//	};
module.exports = filter;
