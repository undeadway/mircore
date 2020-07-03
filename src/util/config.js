const errorController = require("../error/controller");
const controller = require("../core/controller");

let wapper = null, instance = null;

function getControllerInstance () {
	if (!instance) {
		instance = errorController(controller);
	}
	return instance;
}

this.getErrorControllerWapper = () => {
	if (wrapper === null) {

		wrapper = {
			instance: getControllerInstance(),
			inspectors: [],
			name: {
				path: "/error",
				route: ['error'],
				type: Function.getName(instance)
			}
		};
	}
	return wrapper;
};
this.getControllerInstance = getControllerInstance;