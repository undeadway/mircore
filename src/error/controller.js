/**
 * 错误的 controller
 */

var controller = require("../core/controller"),
	getError = require("./errorconfig").getError;
var developMode = require(("../config/app")).developMode;
var htmlEscape = String.htmlEscape;
var ERROR_HTML_FILE = __dirname + "/error.html";
var baseAction = require("../core/base_action");

function errorController() {

	var ctrler = controller();
	ctrler.addAction(indexAction);

	return ctrler;
}

function indexAction() {
	let action = baseAction();

	action.execute = function() {

		let ctrler = action.controller;
		let getAttr = ctrler.getAttr;
		let errorcode = getAttr('code');

		ctrler.setAttrs(getError(errorcode));
		ctrler.setAttr('isDevelopMode', getDegelopMode);

		Coralian.logger.err(getAttr('message'));
		Coralian.logger.err(getAttr('stack'));
		ctrler.render(errorcode, ERROR_HTML_FILE, true);
	}

	return action;
}

function getDegelopMode() {
	return developMode;
}

module.exports = errorController;