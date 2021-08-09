const fs = require("fs");
const md5 = require("md5");

function file (fn, data) {

	const buffer = Buffer.from(data);
	const hash = md5(data);

	return {
		saveTo: (path, name) => {
			path = path || `${__dirname}/temp`;
			name = name || hash;

			fs.writeFileSync(`${path}/${name}`, buffer);
		},
		getFileName: () => {
			return fn;
		},
		getBinaryData: () => {
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
