/**
 * 文件处理功能
 * 读取文件，
 * 如果是二进制文件，可以对文件进行二进制输出
 */

const fs = require("fs");
const md5 = require("md5");
const fileinfo = require("fileinfo");
(() => {
	const fileAPis = require("file-api");
	Object.assign(global, fileAPis);
})();
const STR_BINARY = "binary";


function File (filename /* 带有后缀 */, buffer) {

	let { mime, extension } = fileinfo.fromBuffer(buffer);
	const hash = md5(buffer);
	filename = filename.split("/").pop();

	if (!String.endsWith(filename, extension)
		&& (extension === "jpg"
			|| ( String.endsWith(filename, ".jpeg") && String.endsWith(filename, ".jpg")) 
	)) {
		filename += `.${extension}`;
	}

	this.save = (path, name) => {
		path = path || process.cwd() + `/temp`;
		name = name || `${hash}.${extension}`;
		fs.writeFileSync(`${path}/${name}`, buffer, STR_BINARY);
	}

	this.getHash = () => {
		return hash;
	};

	this.getFileName = () => {
		return filename;
	};

	this.getBinaryData = () => {
		return buffer;
	};

	this.getBase64Data = () => {
		let data = buffer.toString("base64");
		return `${mime};base64,${data}`;
	}

	this.getMime = () => {
		return mime;
	};
}

module.exports = {
	isFile: (obj) => {
		return obj instanceof File;
	},
	canAccess: (path, method = fs.constants.R_OK) => {
		try {
			fs.accessSync(path, method);
			return true;
		} catch {
			return false;
		}
	},
	create: (input) => {

		let filename, buffer;

		if (typeIs(input, "string")) {
			try {
				fs.accessSync(input, fs.constants.R_OK);

				filename = input;
				buffer = fs.readFileSync(input, STR_BINARY);
			} catch {
				// 当对象文件不存在或无法处理时，返回 null，而不抛出错误
				return null;
			}
		} else {
			filename = input.filename;
			buffer = Buffer.from(input.data, STR_BINARY);
		}

		let file = new File(filename, buffer);
		return file;
	}
};
