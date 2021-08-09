const fs = require("fs");
const md5 = require("md5");

function file (fn, data) {

	const buffer = Buffer.from(data);
	const has = md5(data);

	return {
		saveTo: (path, name) => {

		},
		getFileName: () => {
			return fn;
		},
		getBrinaryData: () => {
			return buffer;
		},
		getBase64Data: () => {
			return buffer.toString("base64");
		}
	};
}

module.exports = {
	query: (data, disposition) => {
		let filename = disposition.match(/filename="(.+?)"/)[1];

		return file(filename, data);
	}
};
