/**
 * 缓存模块
 * 每次利用缓存，需要先用 get(space) 来获得想对应的空间，然后在获得的空间内对缓存进行处理
 * 删除也只能针对空间进行删除
 */

let _getCache = require("../config/app").getCache;
let CACHES = {};

function cacheUsed(space) {
	return _getCache(space);
}

this.cacheUsed = cacheUsed;

function create(space) {
	let isUsed = cacheUsed(space);

	if (!isUsed) {
		Error.unsupportedOperation(space + " 的 cache 没有被启用，无法创建对应空间");
	}

	let cacheObj = CACHES[space];
	if (!cacheObj) {
		Eureka.logger.log("create " + space + " cache space.");
		CACHES[space] = cacheObj = {};
	} else {
		Error.unsupportedOperation(space + " 的 cache 空间已经创建，请勿重复创建");
	}

	return getCache(isUsed, cacheObj);
}

this.remove = function (space) {
	let cacheObj = CACHES[space]
	delete CACHES[space];
	return cacheObj;
}

this.get = function (space) {

	let cacheObj = CACHES[space];
	if (!cacheObj) cacheObj = create(space);

	return getCache(_getCache(space), cacheObj);
}

this.isUsed = getCache;

function getCache(routes, cacheObj) {

	// routes 必须有值才算开启
	let isUsed = (routes) ? (!routes.isEmpty()) : false;

	Eureka.logger.log("routes : " + routes);

	return {
		isUsed: function (route) {

			Eureka.logger.log("Now route : " + route);

			if (isUsed) {
				for (let i = 0; i < routes.length; i++) {
					if (route.contains(routes[i])) {
						return true;
					}
				}
			}
			return false;
		},
		get: function (key) {
			if (!isUsed) {
				Error.unsupportedOperation(space + " 的 cache 没有被启用，无法从对应空间中获取数据");
			}
			return cacheObj[key];
		},
		save: function (key, value) {
			if (!isUsed) {
				Error.unsupportedOperation(space + " 的 cache 没有被启用，无法将数据存入对应空间");
			}
			cacheObj[key] = value;
		},
		remove: function (key) {
			let obj = cacheObj[key];
			delete cacheObj[key];
			return obj;
		}
	};
}