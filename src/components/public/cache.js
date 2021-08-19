/**
 * 缓存模块
 * 每次利用缓存，需要先用 get(space) 来获得想对应的空间，
 * 然后在获得的空间内对缓存进行处理，删除也只能针对空间进行删除。
 * 设置空间的目的是区分不同种别的 cache ，
 * 可以让某些模块启用 cache ，某些模块不启用 cache。
 * 从而避免全局配置的 cache 污染。
 */

const Cache = require("cache");
const { getCacheConfig } = require("../../util/app-config");
const { unsupportedOperation } = Error;

const caches = {};
const STR_GLOBAL = "global";
const NUM_DETAULE_EXPIRE = 30;

function usedCheck(name = STR_GLOBAL) {
	let config = getCacheConfig(name);
	if (config === null) {
		unsupportedOperation(name + " 的 cache 没有被启用，无法创建对应空间");
	}
	return config;
}

this.put = (space, key ,val) => {

	let config = usedCheck(space);

	let cache = caches[space];
	if (!cache) {
		cache = caches[space] = new Cache((config.expire || NUM_DETAULE_EXPIRE) * 1000 * 60);
	}

	cache.put(key, val);

};

this.get = (space = STR_GLOBAL, name) => {

	let cache = caches[space];
	if (!cache) {
		return null;
	}

	return cache.get(name);
};

this.del = (space = STR_GLOBAL, name) => {

	let cache = caches[space];
	if (!cache) {
		return null;
	}

	let obj = cache[name];

	delete cache[name];

	return obj;
};

this.cacheUsed = (name = STR_GLOBAL) => {
	let config = getCacheConfig(name);
	return !!config;
};