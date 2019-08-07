/**
 * 所有 logic 的基类
 * 从这个类扩展其他 logic 类
 * 
 * 本类只定义 getRequestRoute 这个最原始的方法，其他方法都要靠子类来实现
 * execute 是个抽象方法，需要其他子类实现
 */
const CONTROLLER = "Controller";

function baseAction() {

	return {
		invoke : function(ctrler) {
			this.controller = ctrler;
			// 这个方法需要子类覆盖重写
			this.execute();
		},
		getRequestRoute : function() {
			return this.controller.getTypeName().replace(CONTROLLER, String.BLANK);
		}
	};
}

module.exports = baseAction;
