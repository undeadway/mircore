/**
 * 路径过滤器
 * 通过请求路径和文件夹路径来查找是否是合法的路径。
 * 如果是已注册的路径（可用模块），
 * 则返回请求该路径所对应的controller，否则返回 404 。
 */
var CONTROLLER_PATH = pathResolve("/src/modules{?}/controller");
var INDEX = '/index',
	SLASH = "/",
	CONTROLLER = "Controller",
	INDEX_NAME = ['index'];
var errorCast = Error.errorCast,
	firstToUpperCase = Coralian.util.StringUtil.firstToUpperCase;
var {getRoute, addRoute, delRoute} = require("../config/app");
var fileExistsSync = require("fs").existsSync,
	getGlobalInspectors = require("../util/utils").privates.getGlobalInspectors;
var ERROR_CTRLER_INSTANCE = require("../error/controller");
var ERROR_CTRLER_WRAPPER = {
	instance: ERROR_CTRLER_INSTANCE,
	inspectors: [],
	name: {
		route: ['error'],
		type: ERROR_CTRLER_INSTANCE.getName()
	}
};
var CONTROLLER_MAPPING = {
	'/error': ERROR_CTRLER_WRAPPER
};

function getController(req, res, route) {

	var ctrlerWrapper, name = route;

	if(name === SLASH) {
		name = INDEX;
	}

	name = name.split(SLASH);
	name.shift();
	var count = name.length - 1;

	if(count > 0 && name[count].isEmpty()) {
		name.pop();
	}

	for(; count >= 0; count--) {

		var ctrlerName = getRoute(SLASH + name.join(SLASH));

		if(ctrlerName === undefined) { // 非已注册的路径则判断非法路径，不做请求处理，进入下一轮循环
			name.pop();
		} else {
			ctrlerWrapper = CONTROLLER_MAPPING[ctrlerName];

			if(ctrlerWrapper) { // 若 CONTROLLER_MAPPING 中已包含请求路径，则直接返回所对应的 Controller
				return ctrlerWrapper;
			}
			// 通过请求的 URL 来动态分析当前环境下所对应的 Controller 路径
			var ctrlerPath = CONTROLLER_PATH.replace("{?}", ctrlerName);
			if(fileExistsSync(ctrlerPath + ".js")) {
				return putController(require(ctrlerPath), ctrlerName);
			} else { // 当解析 Controller 路径不存在的时候，认为该请求路径非法，进入下一轮循环
				name.pop();
			}
		}
	}

	if(!ctrlerWrapper && count === 0) {
		return putController(require(CONTROLLER_PATH.replace("{?}", INDEX)), INDEX);
	} else {
		req.parse.error = 404;
		return ERROR_CTRLER_WRAPPER;
	}
}

function putController(ctrler, ctrlerName) {

	var instance = ctrler;

	var ctrlerWrapper = CONTROLLER_MAPPING[ctrlerName] = {
		instance: instance,
		inspectors: ctrler.inspectors || [],
		name: {
			path: ctrlerName,
			route: ctrlerName.split("/"), // 文件系统的物理路径
			type: instance.getName()
		}
	};
	return ctrlerWrapper;
}

function invokeController(req, res, route) {

	try {
		var ctrler = getController(req, res, route);
		var instance = ctrler.instance();

		/*
		 * 在 controller 中判断是否正常执行
		 * 在 Controller 得到是否正常执行判断后进行后续操作
		 * 在正常执行时，需要先执行 Global 级的 inspector 再执行 Filter 级的 inspector
		 * 非正常执行时，直接在 Controller 中 调用错误处理，所以在 filter 中不用做额外处理
		 */
		if(instance.judgeExecute(req, res, ctrler.name)) {
			// 全局 inspector 的执行
			invokeGlobalInspectors(instance, getFilterInvocation(instance, req, res, ctrler.inspectors));
		}
	} catch(e) {
		e.code = Coralian.constants.HttpStatusCode.INTERNAL_SERVER_ERROR;
		Coralian.logger.err(e.mesage);
		Coralian.logger.err(e.stack);
		req.parse.error = e;
		var exe = ERROR_CTRLER_INSTANCE();
		if(exe.judgeExecute(req, res, ERROR_CTRLER_WRAPPER.name)) {
			exe.execute();
		}
	}
}

function invokeGlobalInspectors(ctrler, fi) {

	var inspectors = getGlobalInspectors();
	var count = inspectors.length,
		index = 0;

	function end() {
		index = count + 1;
	}
	
	// 因为 所有 的 inspector 都要用得到 controller 所以将 GlobalInvocation 放在这里实现
	({ // GlobalInvocation
		getController: function() {
			return ctrler;
		},
		execute: function() {
			if(index < count) {
				inspectors[index++].inspect(this);
			} else if(index++ === count) {
				fi.execute(); // 当global  inspector 被执行完时，执行 filter inspector
				end();
			}
		},
		end: end
	}).execute();
}

function getFilterInvocation(ctrler, req, res, inspectors) {

	var count = inspectors.length,
		index = 0;

	function end() {
		index = count + 1;
	}

	
	var fi = { // 这里的对象就是 ControllerInvocation
		execute: function() {
			if(index < count) {
				inspectors[index++].inspect(this); // 执行递归，进行下一轮检查
			} else if(index++ === count) {
				ctrler.execute(); // 当inspector 被执行完时，执行 controller
				end();
			}
		},
		redirect: ctrler.redirect,
		getController: function() {
			return ctrler;
		},
		/* 
		 * 当目标请求的 controller 被逻辑拒绝的时候，调用这个方法来更替 controller 以及执行后续操作
		 */
		resetController: function(rename) {
			if('string' !== typeof rename) {
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
