const fs = require("fs");
const md5 = require("md5");
const mime = require('mime');
function File (fillename, buffer, type) {

	const _mime = mime.getType(type);
	const hash = md5(buffer.toString());
	fillename = fillename || hash;

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
	this.getFileNameWithType = () => {
		return `${filename}.${type}`;
	}

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

		let filename, buffer, type;

		if (typeIs(input, "string")) {
			let fn = input.split("/");
			try {
				fs.accessSync(input, fs.constants.R_OK);

				buffer = fs.readFileSync(input, "binary");
				let str = buffer.toString();
	
				filename = fn[fn.length - 1];
				if (str === buffer) { // 文本格式
					// TODO 这里判断文件后缀的办法还要再改
					let types = filename.split(".");
					type = types[types.length - 1];
					type = type || "txt"; // 如果没有文件后缀，则全部设置为 txt
				} else {
					type = str.slice(1, str.indexOf("\r\n"));
				}
			} catch {
				// 当对象文件不存在或无法处理时，返回 null，而不抛出错误
				return null;
			}
		} else {
			filename = input.filename;
			buffer = Buffer.from(input.data, "binary");
			type = input.type;
		}
		return new File(filename, buffer, type.toLowerCase());
	}
};
