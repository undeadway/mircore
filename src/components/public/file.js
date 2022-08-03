/**
 * 文件处理功能
 * 读取文件，
 * 如果是二进制文件，可以对文件进行二进制输出
 */

const fs = require("fs");
const md5 = require("md5");
const fileinfo = require("fileinfo");
const { String } = require("./../constants");

function File (filename /* 带有后缀 */, buffer, isStr, isTxt) {

	let tmpObj = isStr ? 
		fileinfo.fromString(isTxt ? filename : buffer)
		: fileinfo.fromBuffer(buffer);

	let { mime, extension } = tmpObj;
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
		fs.writeFileSync(`${path}/${name}`, buffer, String.BINARY);
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
		let data = buffer.toString(String.BASE64);
		return `${mime};${String.BASE64},${data}`;
	}

	this.getMime = () => {
		return mime;
	};
}

function canAccess (path, method = fs.constants.R_OK) {
	try {
		file = fs.accessSync(path, method);
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	isFile: (obj) => {
		return obj instanceof File;
	},
	canAccess,
	create: (input, {isTxt = false, readType = String.BINARY}) => {
		let filename, buffer;
		let isStr = false;
	
		if (typeIs(input, "string")) {
	
			// 当对象文件不存在或无法处理时，返回 null，而不抛出错误
			if (!canAccess(input)) return null;
	
			filename = input;
			buffer = fs.readFileSync(input, readType);
		} else {
			filename = input.filename;
			buffer = input.data;
		}
	
		
		if (isTxt) {
			// 暂时还无法处理纯文本
			isStr = true;
		} else if (fileinfo.isSVGString(buffer.toString())) {
			buffer = buffer.toString();
			isStr = true;
		} else if (!isTxt) {
			buffer = Buffer.from(buffer, String.BINARY);
		}
	
		try {
			let file = new File(filename, buffer, isStr, isTxt);
			return file;
		} catch (e) {
			console.log(e);
			// 当对象文件不存在或无法处理时，返回 null，而不抛出错误
			return null;
		}
	}
};