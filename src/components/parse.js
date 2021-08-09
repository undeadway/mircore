/**
 * 处理 parse 的功能
 */

const url = require("url"), qs = require("querystring");
const file = require("./file");
const CONTENT_DISPOSITION = "Content-Disposition",
	CONTENT_TYPE = "Content-Type";

const { DELETE, PUT, POST, HEAD, OPTIONS, GET, CONNECT, TRACE, PATCH } = Coralian.constants.HttpRequestMethod;
const unsupportedOperation = Error.unsupportedOperation;

function parseFormData (str, parse) {

	let arr = str.split("\r\n");
	let query = {}, files = {}, isFirst = true; // 全局
	let name = null, data = [], isFile = false, // 单参数
		contentDisposition = null, contentType = null;

	let first = arr[0]; // 第一行

	for (let i = 1, len = arr.length; i < len; i++) {
		let line = arr[i];
		if (String.isEmpty(line)) continue;

		if (String.startsWith(line, CONTENT_DISPOSITION)) {
			contentDisposition = line.slice(CONTENT_DISPOSITION.length + 2);
		} else if (String.startsWith(line, CONTENT_TYPE)) {
			contentType = line.slice(CONTENT_TYPE.length + 2);
		} else if (String.startsWith(line, first)) { // 这里表示获得到一条完整的数据
			name = contentDisposition.match(/name="(.+?)"/)[1];
			let obj = data.join(String.BLANK);
			if (contentType !== null) {
			if (!/filename="(.+?)"/.test(contentDisposition)) continue;
				files[name] = file.query(obj, contentDisposition, contentType);
			} else {
				query[name] = String.trim(obj);
			}
			data = [];
			contentDisposition = null;
			contentType = null;
		} else {
			data.push(line);
		}
	}

	parse.query = query;
	parse.files = files;
}

module.exports = () => {

	let chunks = [], size = 0;
	let parse = null, method;
	let req = null, res = null;

	return {
		init: (_req, _res) => {
			req = _req, res = _res;
			req.url = req.url.replace(/\/{2,}/g, "/");
			parse = req.parse = url.parse(req.url, true);
			method = req.method = req.method.toUpperCase();
		},
		push: (chunk) => {
			chunks.push(chunk);
			size += chunk.length;
		},
		end: (request) => {
			let str = chunks.join(String.BLANK);

			switch (method) {
				case DELETE: // PUT、DELETE 都采用和 POST 一样的实现
				case PUT:
				case POST:
					if (String.contains(str, "Content-Disposition")) { // TODO 这里的处理可能还要再分其他情况
						parseFormData(str, parse);
					} else {
						Object.addAll(qs.parse(str), parse.query);
					}
				// 因为都要调用 request 方法，所以这里 switch 贯穿掉
				case HEAD:
				case OPTIONS: // 这里主要考虑到有跨域请求
				case GET:
					Object.addAll(qs.parse(str), parse.query);
					request(req, res);
					break;
				case CONNECT: // TODO 下面这些暂时不做实现
				case TRACE:
				case PATCH:
				default:
					unsupportedOperation(method);
			}
		}
	};
};