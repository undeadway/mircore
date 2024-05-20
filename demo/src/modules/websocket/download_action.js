const { actions: { baseAction }, config } = mircore;


function indexAction() {
	const action = baseAction();

	action.execute = () => {
		let filename =  config.mode && config.mode.develop ? "e:/Downloads/" : "/home/waygc/downloads/";
		const ctrler = action.controller;
		const param1 = ctrler.getPara(0);
		filename += param1;
		try {
			ctrler.render("binary", filename);
			ctrler.end((connection, reasonCode, description) => {
				console.log(connection, reasonCode, description);
			});
		} catch (err) {
			console.log(err);
		} finally {

		}
	};

	return action;
}

module.exports = indexAction;