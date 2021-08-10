const { controller, file } = mircore;
const PAGE = "/res/html/image.html"

function nonoController() {

	const ctrler = controller();

	ctrler.addAction(() => {

		let fd1 = ctrler.getFile("data1");

		let data1 = fd1.getBase64Data();
		let base641 = `data:${data1}`;
		ctrler.setAttr("hash1", fd1.getHash());
		ctrler.setAttr("base641", base641);

		let fd2 = ctrler.getFile("data2");

		let data2 = fd2.getBase64Data();
		let base642 = `data:${data2}`;
		ctrler.setAttr("hash2", fd2.getHash());
		ctrler.setAttr("base642", base642);

		ctrler.setAttr("txt1", ctrler.getQuery("txt1"));
		ctrler.setAttr("txt2", ctrler.getQuery("txt2"));

		ctrler.render({url: PAGE});
	}, "post");

	return ctrler;
}

module.exports = exports = nonoController;