const { controller, actions: { baseAction } } = mircore;



function indexAction() {
	const action = baseAction();

	action.execute = () => {
		const ctrler = action.controller;
		const param1 = ctrler.getPara(0);
		const data = Math.random() * 0xFFFFFF;
		ctrler.render("utf8", data + param1);
		ctrler.end((connection, reasonCode, description) => {
			console.log(connection, reasonCode, description);
		});
	};

	return action;
}

module.exports = indexAction;