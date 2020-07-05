/**
 * 所有 action 的基类
 * 从这个类扩展其他 action 类
 * 
 * 本类只定义 getRequestRoute 这个最原始的方法，其他方法都要靠子类来实现
 * execute 是个抽象方法，需要其他子类实现
 */
const AjaxRenderType_JSON = require("../util/utils").publics.constants.AjaxRenderType.JSON;
const CONTROLLER_STR = "Controller";

function baseAction() {

	return {
		invoke: function (ctrler) {
			this.controller = ctrler;
			this.execute(); // 这个方法需要子类覆盖重写
		},
		getRequestRoute: function () {
			return this.controller.getTypeName().replace(CONTROLLER_STR, String.BLANK);
		}
	};
}

/**
 * action 最基本的子类之一，用于返回所有的 ajax 处理
 * 默认返回 JSON 字符串，如果需要返回不同类型（比如XML）
 * 需要通过指定 execute 的第二个参数来选择类型
 * 如果想要实现更复杂的处理方式，请自行添加相关子类来实现。
 * 子类都需要覆盖 query 方法
 */
function ajaxAction() {

	let action = baseAction();

	action.execute = function (renderType = AjaxRenderType_JSON) {
		action.renderAjax = action.controller['render' + renderType];
		action.query(); // 这个方法需要子类覆盖重写
	};

	return action;
}

module.exports = { baseAction, ajaxAction };