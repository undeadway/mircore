const { controller, actions: { baseAction } } = mircore;



function indexAction() {
	const action = baseAction();

	action.execute = () => {
		const ctrler = action.controller;
		ctrler.renderBinary({url: ctrler.getReqPath()});
        ctrler.end();
	};

	return action;
}

module.exports = indexAction;