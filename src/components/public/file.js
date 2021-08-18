const fs = require("fs");
const md5 = require("md5");
const mime = require('mime');
const extname = require('path').extname;

function File (fillename /* 带有后缀 */, buffer) {

	const [hash, type] = (() => {
		let str = buffer.toString();

		if (str === buffer) { // 文本格式
			type = extname(filename).slice(1);
		} else {
			type = str.slice(1, str.indexOf("\r\n"));
		}

		return [md5(str), type];
	})();

	const _mime = mime.getType(type);

	this.save = (path, name) => {
		path = path || process.cwd() + `/temp`;
		name = name || `${hash}.${type}`;
		fs.writeFileSync(`${path}/${name}`, buffer, "binary");
	}

	this.getHash = () => {
		return hash;
	};

	this.getFileName = () => {
		return fillename;
	};

	this.getBinaryData = () => {
		return buffer;
	};

	this.getBase64Data = () => {
		let data = buffer.toString("base64");
		return `${_mime};base64,${data}`;
	}

	this.getMime = () => {
		return _mime;
	};
}

module.exports = {
	isFile: (obj) => {
		return obj instanceof File;
	},
	create: (input) => {

		let filename, buffer;

		if (typeIs(input, "string")) {
			let fn = input.split("/");
			try {
				fs.accessSync(input, fs.constants.R_OK);

				buffer = fs.readFileSync(input, "binary");
				filename = fn[fn.length - 1];
			} catch {
				// 当对象文件不存在或无法处理时，返回 null，而不抛出错误
				return null;
			}
		} else {
			filename = input.filename;
			buffer = Buffer.from(input.data, "binary");
		}
		return new File(filename, buffer);
	}
};
