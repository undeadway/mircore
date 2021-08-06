/**
 * 程序的基本配置
 * 这个配制是程序上的配置，不是网站配置
 * 主要是配置网站启动的端口、转发路径等
 */

const config = JSON.parse(require("fs").readFileSync(pathResolve("/res/json/app.json"), "utf-8"));
const { cache, routes } = config;
const routesName = Object.keys(routes);
const { Mark } = Coralian.constants;
const STR_GLOBAL = "global";

Object.defineProperty(exports, "port", {
	value: (config.port || 9000),
	writable: false
});
Object.defineProperty(exports, "developMode", {
	value: !!config["develop-mode"],
	writable: false
});
Object.defineProperty(exports, "clusterMode", {
	value: !!config["cluster-mode"],
	writable: false
});
Object.defineProperty(exports, "appName", {
	value: config["app-name"],
	writable: false
});
Object.defineProperty(exports, "splitMark", {
	value: (config["split-mark"] || ":"),
	writable: false
});
Object.defineProperty(exports, "routesName", {
	value: routesName,
	writable: false
});
Object.defineProperty(exports, "routes", {
	value: {
		get: (name) => {
			return routes[name];
		},
		add:  (name, value) => {
			if (!routes[name]) return false;
			routes[name] = value;
			return true;
		},
		del: (name) => {
			var route = routes[name];
			delete routes[name];
			return route;
		},
		hasFuzzyMatching:  () => {
			return !!routes[`${Mark.SLASH}${Mark.ASTERISK}`];
		}
	},
	writable: false
});
// Object.defineProperty(exports, "getRoute", {
// 	value: ,
// 	writable: false
// });
// Object.defineProperty(exports, "addRoute", {
// 	value:,
// 	writable: false
// });
// Object.defineProperty(exports, "delRoute", {
// 	value: ,
// 	writable: false
// });
Object.defineProperty(exports, "getCacheConfig", {
	value: (name) => {
		if (!cache) return null;
		if (!name) {
			return cach[STR_GLOBAL] || null;
		}
		return cache[name] || null;
	},
	writable: false
});

Object.defineProperty(exports, "getConfig", {
	value: (name) => {
		return config.config[name];
	},
	writable: false
});