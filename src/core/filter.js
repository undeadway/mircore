/**
 * 路径过滤器
 * 通过请求路径和文件夹路径来查找是否是合法的路径。
 * 如果是已注册的路径（可用模块），
 * 则返回请求该路径所对应的controller，否则返回 404 。
 */
const CONTROLLER_PATH = pathResolve("/src/modules{?}/controller");
const INDEX = '/index', SLASH = "/";
const { errorCast } = Error;
const { getRoute } = require("../util/app-config");
const fileExistsSync = require("fs").existsSync,
	getGlobalInspectors = require("../util/utils").privates.getGlobalInspectors;
const CONTROLLER_MAPPING = require("./../util/controller-mapping");

function getController(req, route) {

	let ctrlerWrapper, name = route;

	if (name === SLASH) {
		name = INDEX;
	}

	name = name.split(SLASH);
	name.shift();
	let count = name.length - 1;

	if (count > 0 && String.isEmpty(name[count])) {
		name.pop();
	}

	for (; count >= 0; count--) {

		let ctrlerName = getRoute(SLASH + name.join(SLASH));

		if (ctrlerName === undefined) { // 非已注册的路径则判断非法路径，不做请求处理，进入下一轮循环
			name.pop();
		} else {
			ctrlerWrapper = CONTROLLER_MAPPING.get(ctrlerName);

			if (ctrlerWrapper) { // 若 CONTROLLER_MAPPING 中已包含请求路径，则直接返回所对应的 Controller
				return ctrlerWrapper;
			}
			// 通过请求的 URL 来动态分析当前环境下所对应的 Controller 路径
			let ctrlerPath = CONTROLLER_PATH.replace("{?}", ctrlerName);
			if (fileExistsSync(ctrlerPath + ".js")) {
				return CONTROLLER_MAPPING.put(ctrlerName, require(ctrlerPath));
			} else { // 当解析 Controller 路径不存在的时候，认为该请求路径非法，进入下一轮循环
				name.pop();
			}
		}
	}

	if (!ctrlerWrapper && count === 0) {
		return CONTROLLER_MAPPING.put(INDEX, require(CONTROLLER_PATH.replace("{?}", INDEX)));
	} else {
		req.parse.error = 404;
		return CONTROLLER_MAPPING.error();
	}
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
		if (instance.judgeExecute(req, res, ctrler.name)) {
			// 全局 inspector 的执行
			invokeGlobalInspectors(instance, getFilterInvocation(instance, req, res, ctrler.inspectors));
		}
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

function invokeGlobalInspectors(ctrler, fi) {

	let inspectors = getGlobalInspectors();
	let count = inspectors.length,
		index = 0;

	function end() {
		index = count + 1;
	}

	// 因为 所有的 inspector 都要用得到 controller 所以将 GlobalInvocation 放在这里实现
	({ // GlobalInvocation
		getController: function () {
			return ctrler;
		},
		execute: function () {
			if (index < count) {
				inspectors[index++].inspect(this);
			} else if (index++ === count) {
				fi.execute(); // 当 global  inspector 被执行完时，执行 filter inspector
				end();
			}
		},
		end: end
	}).execute();
}

function getFilterInvocation(ctrler, req, res, inspectors) {

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
				ctrler.execute(); // 当inspector 被执行完时，执行 controller
				end();
			}
		},
		redirect: ctrler.redirect,
		getController: function () {
			return ctrler;
		},
		/* 
		 * 当目标请求的 controller 被逻辑拒绝的时候，调用这个方法来更替 controller 以及执行后续操作
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
		/*
		 * 强制结束 ci 递归调用的函数
		 */
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
