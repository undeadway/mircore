/**
 * 错误的 controller
 */
const controller = require("./../core/controller");
const { getError } = require("./errorconfig");
const { developMode } = require("../util/app-config");
const { baseAction } = require("./../core/actions");
const HttpStatusCode = Coralian.constants.HttpStatusCode;
const ERROR_HTML_FILE = __dirname + "/error.html";

function errorController() {

	let ctrler = controller();
	ctrler.addAction(indexAction);

	return ctrler;
}

function indexAction() {
	let action = baseAction();

	action.execute = function () {

		let ctrler = action.controller;
		let getAttr = ctrler.getAttr;
		let errorcode = getAttr('code');
		let error = getError(errorcode);

		ctrler.setAttrs(error);
		ctrler.setAttr('isDevelopMode', getDegelopMode);
		let not404 = errorcode !== HttpStatusCode.NOT_FOUND;
		ctrler.setAttr('not404', () => {
			return not404;
		})

		if (not404) {
			Coralian.logger.err(error);
		} else {
			Coralian.logger.log(error.errormsg);
		}

		ctrler.render({code: errorcode, url: ERROR_HTML_FILE});
	}

	return action;
}

function getDegelopMode() {
	return developMode;
}

module.exports = errorController;