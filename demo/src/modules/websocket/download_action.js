const { actions: { baseAction }, config } = mircore;


function indexAction() {
	const action = baseAction();

	action.execute = () => {
		let filename =  config.mode && config.mode.develop ? "e:/Downloads/" : "/home/waygc/downloads/";
		const ctrler = action.controller;
		const param1 = ctrler.getPara(0);
		filename += param1;
		try {
			let data = fs.readFileSync(filename);
			data = Buffer.from(data, "binary");
			ctrler.render("binary", data);
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