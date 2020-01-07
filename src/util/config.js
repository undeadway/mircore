const ERROR_CTRLER_INSTANCE = require("./../error/controller");
const ERROR_CTRLER_WRAPPER = {
	instance: ERROR_CTRLER_INSTANCE,
	inspectors: [],
	name: {
		path: "/error",
		route: ['error'],
		type: Function.getName(ERROR_CTRLER_INSTANCE)
	}
};

this.getControllerInstance = () => {
	return ERROR_CTRLER_INSTANCE;
};

this.getControllerWrapper = () => {
	return ERROR_CTRLER_WRAPPER;
};