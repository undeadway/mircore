const { controller, util: { mail } } = mircore;

function mailController () {

	const ctrler = controller();

	ctrler.addAction({
		action: () => {

			mail({
				targets: ["undeadway@163.com"],
				subject: "测试邮件",
				html: "<html><body>hello.</body></html>",
				success: (res) => {
					ctrler.render({
						url: JSON.stringify(res)
					});
				},
				fail: () => {

				}
			});
		}
	});

	return ctrler;

}

module.exports = mailController;