const errorController = require("../error/controller");
const controller = require("../core/controller");

let wrapper = null, instance = null;

function getErrorControllerInstance () {
	if (!instance) {
		instance = errorController(controller);
	}
	return instance;
}

this.getErrorControllerWrapper = () => {
	if (wrapper === null) {

		wrapper = {
			instance: getErrorControllerInstance(),
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
this.getErrorControllerInstance = getErrorControllerInstance;