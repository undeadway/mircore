const { controller, file } = mircore;
const PAGE = "/res/html/image.html"
const file_name = "/home/waygc/Desktop/ttplayer-logo(1).png";


function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {

		let fd = ctrler.getFile("data1");
		let lfg = file.create(file_name);

		let data = fd.getBase64Data();
		let base64 = `data:${data}`;
		let base2 = lfg.getBase64Data();
		let base642 = `data:${base2}`;
		ctrler.setAttr("base64", base642);

		// ctrler.render({url: PAGE});
		ctrler.renderFile(lfg);
	}, "post");

	return ctrler;
}

module.exports = exports = nonoController;