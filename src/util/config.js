let wrapper = null, instance = null;

function getErrorController() {
	if (instance === null) {
		instance = require("./../error/controller");
	}
}

this.getControllerInstance = () => {
	getErrorController();
	return instance;
};

this.getControllerWrapper = () => {

	if (wrapper === null) {

		getErrorController();

		wrapper = {
			instance: instance,
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