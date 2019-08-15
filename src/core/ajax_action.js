/**
 * logic 最基本的子类之一，用于返回所有的 ajax 处理
 * 默认返回 JSON 字符串，如果需要返回不同类型（比如XML）
 * 需要通过指定 execute 的第二个参数来选择类型
 * 如果想要实现更复杂的处理方式，请自行添加相关子类来实现。
 * 子类都需要覆盖 query 方法
 */

const baseAction = require("./base_action");
const AjaxRenderType_JSON = require("../util/utils").publics.constants.AjaxRenderType.JSON;

function ajaxAction() {

	var action = baseAction();

	action.execute = function (renderType = AjaxRenderType_JSON) {
		action.renderAjax = action.controller['render' + renderType];
		action.query();
	};

	return action;
}

module.exports = ajaxAction;
