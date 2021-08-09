const fs = require("fs");
const md5 = require("md5");

function File (fn, data, mime) {

	const buffer = Buffer.from(data),
		hash = md5(data);

	this.save = (path, name) => {
		path = path || `${__dirname}/temp`;
		name = name || hash;
		fs.writeFileSync(`${path}/${name}`, buffer);
	}

	this.getFileName = () => {
		return fn;
	};

	this.getBinaryData = () => {
		return buffer;
	};

	this.getBase64Data = () => {
		return buffer.toString("base64");
	}

	this.getMime = () => {
		return mime;
	};
}

module.exports = {
	isFile: (obj) => {
		return obj instanceof File;
	},
	create: (path) => {
		let buffer = fs.readFileSync(path);
		return buffer;
	},
	query: (filename, buffer, type) => {

		return new File(filename, buffer, type);
	}
};
