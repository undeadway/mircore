/**
 * 错误的 controller
 */

const controller = require("../core/controller"),
	getError = require("./errorconfig").getError;
const developMode = require(("../config/app")).developMode;
const ERROR_HTML_FILE = __dirname + "/error.html";
const baseAction = require("../core/base_action");
const HttpStatusCode = Coralian.constants.HttpStatusCode;

function errorController() {

	var ctrler = controller();
	ctrler.addAction(indexAction);

	return ctrler;
}

function indexAction() {
	let action = baseAction();

	action.execute = function () {

		let ctrler = action.controller;
		let getAttr = ctrler.getAttr;
		let errorcode = getAttr('code');

		ctrler.setAttrs(getError(errorcode));
		ctrler.setAttr('isDevelopMode', getDegelopMode);
		let not404 = errorcode !== HttpStatusCode.NOT_FOUND;
		ctrler.setAttr('not404', () => {
			return not404;
		})

		Coralian.logger.err(getAttr('message'));
		if (not404) {
			Coralian.logger.err(getAttr('stack'));
		}
		ctrler.render(errorcode, ERROR_HTML_FILE, true);
	}

	return action;
}

function getDegelopMode() {
	return developMode;
}

module.exports = errorController;