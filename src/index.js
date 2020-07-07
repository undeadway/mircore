require("coralian"); // 预载入 coralian

function pathResolve(name, isFolder) {

	let output = require("path").resolve("." + name);
	if (isFolder) output += "/";
	return output;
}
global.pathResolve = pathResolve;

const that = module.exports = exports = {};

function requireModule(input) {
	require(input);
}

that.requireModule = requireModule;
that.requireModules = (... input) => {
	if (input.length === 1) {
		input = input[0];
	}
	for (let i = 0, len = input.length; i < len ; i++) {
		requireModule(input[i]);
	};
}

that.requireConfig = (input) => {
	requireModule(pathResolve(input));
}

that.requireConfigs = (... input) => {
	if (input.length === 1) {
		input = input[0];
	}
	for (let i = 0, len = input.length; i < len ; i++) {
		requireModule(pathResolve(input[i]));
	};
}

that.start = () => {

	that.controller = require("./core/controller");
	that.sessions = require("./server/sessions");
	that.cache = require("./server/cache");
	that.cookies = require("./server/cookies");
	that.baseAction = require("./core/actions").baseAction;
	that.ajaxAction = require("./core/actions").ajaxAction;
	that.config = require("./config/app");
	that.util = require("./util/utils").publics;
	that.util.parseView = require("./util/parse_view");

	const fs = require("fs");
	const siteappPath = pathResolve("/src/config/siteapp");
	if (fs.existsSync(siteappPath + ".js")) {
		that.config.site = require(siteappPath);
	}

	const server = require("./core/server");
	server();
}
