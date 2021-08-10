const { controller, file } = mircore;
const PAGE = "/res/html/image.html"

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {

		let fd = ctrler.getFile("data1");

		fd.save();

		let data = fd.getBase64Data();
		let base64 = `data:${data}`;
		ctrler.setAttr("base64", base64);

		ctrler.render({url: PAGE});
	}, "post");

	return ctrler;
}

module.exports = exports = nonoController;