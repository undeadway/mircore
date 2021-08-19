/**
 * 文件处理功能
 * 读取文件，
 * 如果是二进制文件，可以对文件进行二进制输出
 */

const fs = require("fs");
const md5 = require("md5");
const mime = require('mime');
const extname = require('path').extname;

/*
 * 该函数来源于：https://github.com/hellosean1025/study/blob/master/function.js
 */
function isTextFile(filepath, length = 1000) {

	let fd = fs.openSync(filepath, "r");
	for( let i = 0; i < length; i++ ) {
		let buf = new Buffer( 1 );
		let bytes = fs.readSync( fd, buf, 0, 1, i );
		let char = buf.toString().charCodeAt();
		if( bytes === 0) {
			return true;
		}else if(bytes === 1 && char === 0){
			return false;
		}
	}
	return true;
}

function File (filename /* 带有后缀 */, buffer) {

	const type = (() => {
		let _type, str = buffer.toString();

		if (isTextFile(filename, buffer.length)) { // 文本格式
			_type = extname(filename).slice(1);
		} else {
			_type = str.slice(1, str.indexOf("\r\n"));
		}

		return _type;
	})();

	const hash = md5(buffer);
	const _mime = mime.getType(type);
	filename = filename.split("/").pop();

	this.save = (path, name) => {
		path = path || process.cwd() + `/temp`;
		name = name || `${hash}.${type}`;
		fs.writeFileSync(`${path}/${name}`, buffer, "binary");
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
				buffer = fs.readFileSync(input, "binary");
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
