const superCtrler = require("./../core/controller")();
const mergeDescriptors = require("merge-descriptors");

module.exports = () => {

	const controller = {};
	mergeDescriptors(controller, superCtrler); // 继承 父类 controller

	let res = null;

	controller.init = (request, response, header) => {
		res = response;
		superCtrler.init(request, response, header);
	}
	
	controller.addAction = ({ name, action, inspectors }) => {
		superCtrler.addAction({name, action, method: "ws", inspectors});
	}
	
	controller.render = (type, data) => {
		res.write(type, data);
	}

	controller.end = (callback) => {
		res.end(callback);
	}

	return controller;
}