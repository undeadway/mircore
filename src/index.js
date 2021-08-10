require("coralian"); // 预载入 coralian

function pathResolve(name, isFolder) {

	if (String.startsWith(name, __dirname)) {
		return name; // 如果已经是绝对文件，则不做处理
	}

	let output = require("path").resolve("." + name);
	if (isFolder) output += "/";
	return output;
}
global.pathResolve = pathResolve;

function requireModule(input) {
	require(input);
}

const that = module.exports = exports = {};

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

	that.md5 = require("md5");
	that.mixin = require('merge-descriptors');

	that.controller = require("./core/controller");
	that.actions = require("./core/actions");
	that.config = require("./util/app-config");
	that.util = require("./util/public-utils");
	that.util.pageTemplate = require("./util/page-template");

	const fs = require("fs");
	const siteappPath = pathResolve("/src/config/siteapp");
	if (fs.existsSync(siteappPath + ".js")) {
		that.config.site = require(siteappPath);
	}

	let files = fs.readdirSync(`${__dirname}/components/public`);
	files.map(file => {
		modName = file.slice(0, file.length - 3);
		that[modName] = require(`./components/public/${file}`);
	});

	const server = require("./core/server");
	server();

	global.mircore = that; // 将 mircore 绑定到 global 上
}