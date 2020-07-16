const MAPPING = {};
const SLASH = "/";
const ERROR_NAME = "/error";

function putContoller(ctrlerName, ctrler) {
	let instance = ctrler;

	let route = ctrlerName.split(SLASH);
	let outRoute = [];

	for (let i = 0, len = route.length; i < len; i++) {
		if (!String.isEmpty(route[i])) {
			outRoute.push(route[i]);
		}
	}

	let ctrlerWrapper = {
		instance: instance,
		inspectors: ctrler.inspectors || [],
		name: {
			path: ctrlerName,
			route: outRoute, // 文件系统的物理路径
			type: Function.getName(instance)
		}
	};
	MAPPING[ctrlerName] = ctrlerWrapper;

	return ctrlerWrapper;
}

function getContoller(ctrlerName) {
	let ctrler = MAPPING[ctrlerName];
	if (ctrlerName === ERROR_NAME && !ctrler) {
		ctrler = putContoller(ctrlerName, require("./../error/controller"))
	}
	return ctrler;
}

exports = module.exports = {
	put: putContoller,
	get: getContoller,
	error: () => {
		return getContoller(ERROR_NAME);
	},
	remove: (name) => {
		let ctrler = MAPPING[name];
		delete MAPPING[name];
		return ctrler;
	}
}