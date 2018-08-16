function pathResolve(name, isFolder) {

	let output = require("path").resolve("." + name);
	if (isFolder) output += "/";
	return output;
}
global.pathResolve = pathResolve;

let that = module.exports = exports = {};

function requireModule(input) {
	require(input);
}

that.requireModule = requireModule;
that.requireModules = (... input) => {
	if (input.length === 1) {
		input = input[0];
	}
	for (let i = 0, len = input.length; i < len ; i++) {
		rquireModule(input[i]);
	};
}

that.requireConfig = (input) => {
	rquireModule(pathResolve(input));
}

that.requireConfigs = (... input) => {
	if (input.length === 1) {
		input = input[0];
	}
	for (let i = 0, len = input.length; i < len ; i++) {
		rquireModule(pathResolve(input[i]));
	};
}

that.start = () => {

	that.controller = require("./core/controller");
	that.sessions = require("./server/sessions");
	that.cache = require("./server/cache");
	that.cookies = require("./server/cookies");
	that.baseAction = require("./core/base_action");
	that.ajaxAction = require("./core/ajax_action");
	that.config = require("./config/app");
	that.util = require("./util/utils").publics;

	let fs = require("fs");
	let siteappPath = pathResolve("/src/config/siteapp");
	if (fs.existsSync(siteappPath + ".js")) {
		that.config.site = require(siteappPath)
	}

	let server = require("./core/server");
	server();
}
