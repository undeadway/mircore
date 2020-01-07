let wrapper = null, instance = null;

this.getControllerInstance = () => {
	if (instance = null) {
		instance = require("./../error/controller");
	}
	return instance;
};

this.getControllerWrapper = () => {

	if (wrapper === null) {
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