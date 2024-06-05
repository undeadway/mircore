/**
 * 文件处理功能
 * 读取文件，
 * 如果是二进制文件，可以对文件进行二进制输出
 * 
 * 目前只能处理图片，将来目标：
 * 1. 可以识别各种文件
 * 2. 可以区分文件形式
 * 
 * 文件来源：
 * 1. 通过 http 形式上传，file 形式，有 content-type
 * 2. base64
 * 3. 读取本地文件
 */
// TODO 当前 file 类只能处理图片
const fs = require("fs");
const { getExtension } = require("mime");
const { Strings } = require("../constants");
const { Encoding } = JsConst;

function File (filename, extension, mime, buffer) {

	const hash = md5(buffer);

	this.writeToDisk = (path, name) => {
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
		let data = buffer.toString(Encoding.BASE64);
		return `${mime};${Encoding.BASE64},${data}`;
	}

	this.getMime = () => {
		return mime;
	};

}

function canAccess (path, method = fs.constants.R_OK) {
	try {
		fs.accessSync(path, method);
		return true;
	} catch {
		return false;
	}
}

/* detect via ArrayBuffer */
function fromBuffer(buffer) {
	if (buffer.byteLength > 4) {
		buffer = buffer.slice(0, 5)
	}

	const signature = bufferToHex(buffer)
	for (let sig in bySignature) {
		if (sig === signature.slice(0, sig.length)) {
			const ext = bySignature[sig]
			return byExtension[ext]
		}
	}
}

function bufferToHex(buffer) {
	const array = new Uint8Array(buffer)
	let hex = ''
	for (let i = 0; i < array.length; i++) {
		const code = array[i].toString(16)
		if (code.length === 1) {
			hex += '0' + code
		} else {
			hex += code
		}
	}
	return hex
}

module.exports = {
	isFile: (obj) => {
		return (obj instanceof File);
	},
	createFromHttp: (input) => {
		let extension = getExtension(input.contentType);
		let buffer = Buffer.from(input.data, String.BINARY);
		return new File(input.filename, extension, input.contentType, buffer);
	},
	createFromPath: (path, obj = { readType: Strings.BINARY }) => {
		
		// 当对象文件不存在或无法处理时，返回 null，而不抛出错误
		if (!canAccess(path)) return null;
		let filename = path;
		let buffer = fs.readFileSync(path, obj.readType);
		buffer = Buffer.from(buffer, String.BINARY);

		// fromBuffer();
		console.log(buffer);

	},
	canAccess
}

// function File (filename /* 带有后缀 */, buffer, isStr, isTxt) {

// 	let tmpObj = isStr ? 
// 		fileinfo.fromString(isTxt ? filename : buffer)
// 		: fileinfo.fromBuffer(buffer);

// 	let { mime, extension } = tmpObj;
// 	const hash = md5(buffer);
// 	filename = filename.split("/").pop();

// 	if (!String.endsWith(filename, extension)
// 		&& (extension === "jpg"
// 			|| ( String.endsWith(filename, ".jpeg") && String.endsWith(filename, ".jpg")) 
// 	)) {
// 		filename += `.${extension}`;
// 	}

// 	this.save = (path, name) => {
// 		path = path || process.cwd() + `/temp`;
// 		name = name || `${hash}.${extension}`;
// 		fs.writeFileSync(`${path}/${name}`, buffer, String.BINARY);
// 	}

// 	this.getHash = () => {
// 		return hash;
// 	};

// 	this.getFileName = () => {
// 		return filename;
// 	};

// 	this.getBinaryData = () => {
// 		return buffer;
// 	};

// 	this.getBase64Data = () => {
// 		let data = buffer.toString(Encoding.BASE64);
// 		return `${mime};${Encoding.BASE64},${data}`;
// 	}

// 	this.getMime = () => {
// 		return mime;
// 	};
// }

// module.exports = {
// 	isFile: (obj) => {
// 		return obj instanceof File;
// 	},
// 	canAccess,
// 	createFromBuffer: ({ filename, contentType, data }) => {

// 	},
// 	create: (input, obj = {isTxt: false, readType: "binary"}) => {
// 		let filename, buffer;
// 		let isStr = false;
	
// 		if (typeIs(input, String.TYPE_NAME)) {
	
// 			// 当对象文件不存在或无法处理时，返回 null，而不抛出错误
// 			if (!canAccess(input)) return null;
	
// 			filename = input;
// 			buffer = fs.readFileSync(input, obj.readType);
// 		} else {
// 			filename = input.filename;
// 			buffer = input.data;
// 		}
	
		
// 		if (obj.isTxt) {
// 			// 暂时还无法处理纯文本
// 			isStr = true;
// 		} else if (fileinfo.isSVGString(buffer.toString())) {
// 			buffer = buffer.toString();
// 			isStr = true;
// 		} else if (!obj.isTxt) {
// 			buffer = Buffer.from(buffer, String.BINARY);
// 		}
	
// 		try {
// 			let file = new File(filename, buffer, isStr, obj.isTxt);
// 			return file;
// 		} catch (e) {
// 			console.log(e);
// 			// 当对象文件不存在或无法处理时，返回 null，而不抛出错误
// 			return null;
// 		}
// 	}
// };