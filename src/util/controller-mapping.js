/**
 * controller 的集合，所有 controller 都在这里进行统一管理
 */
const MAPPING = {};
const { Char } = JsConst;
const ERROR_NAME = "/error";

function putContoller(ctrlerName, ctrler, req) {
	let instance = ctrler;

	let route = ctrlerName.split(Char.SLASH);
	let outRoute = [];

	for (let i = 0, len = route.length; i < len; i++) {
		if (!String.isEmpty(route[i])) {
			outRoute.push(route[i]);
		}
	}

	let ctrlerWrapper = {
		instance: instance,
		inspectors: ctrler.inspectors || [],
		header: {
			path: ctrlerName,
			route: outRoute, // 文件系统的物理路径
			type: Function.getName(instance)
		}
	};
	MAPPING[ctrlerName] = ctrlerWrapper;

	return ctrlerWrapper;
}

function getController(ctrlerName, req) {
	let ctrler = MAPPING[ctrlerName];
	if (ctrlerName === ERROR_NAME && !ctrler) {
		ctrler = putContoller(ctrlerName, require("../error/controller"), req);
	}
	return ctrler;
}

exports = module.exports = {
	put: putContoller,
	get: getController,
	error: (req) => {
		return getController(ERROR_NAME, req);
	},
	"delete": (name) => {
		let ctrler = MAPPING[name];
		delete MAPPING[name];
		return ctrler;
	}
}