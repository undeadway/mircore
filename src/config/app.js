/**
 * 程序的基本配置
 * 这个配制是程序上的配置，不是网站配置
 * 主要是配置网站启动的端口、转发路径等
 */

const config = JSON.parse(require("fs").readFileSync(pathResolve("/res/json/app.json"), "utf-8"));
const cache = config.cache;
const routes = config.routes;
const routesName = Object.keys(routes);
const database = (!!config.database) ? require(config.database) : null;
//delete config.database;

Object.defineProperty(exports, 'database', {
	value: database,
	writable: false
});
Object.defineProperty(exports, 'port', {
	value: (config.port || 9000),
	writable: false
});
Object.defineProperty(exports, 'developMode', {
	value: !!config.develop,
	writable: false
});
Object.defineProperty(exports, 'clusterMode', {
	value: !!config.cluster,
	writable: false
});
Object.defineProperty(exports, 'appName', {
	value: config.name,
	writable: false
});
Object.defineProperty(exports, 'split', {
	value: (config.split || ':'),
	writable: false
});
Object.defineProperty(exports, 'routesName', {
	value: routesName,
	writable: false
});
Object.defineProperty(exports, 'getRoute', {
	value: function (name) {
		return routes[name];
	},
	writable: false
});
Object.defineProperty(exports, 'addRoute', {
	value: (name, value) => {
		if (!routes[name]) return false;
		routes[name] = value;
		return true;
	},
	writable: false
});
Object.defineProperty(exports, 'delRoute', {
	value: (name) => {
		var route = routes[name];
		delete routes[name];
		return route;
	},
	writable: false
});
Object.defineProperty(exports, 'getCache', {
	value: function (name) {
		if (!cache) return null;
		return cache[name];
	},
	writable: false
});
Object.defineProperty(exports, 'getConfig', {
	value: (name) => {
		return config.config[name];
	},
	writable: false
});