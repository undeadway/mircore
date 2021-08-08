/**
 * 处理 parse 的功能
 */

const url = require("url"), qs = require("querystring");
const file = require("./file");

const { DELETE, PUT, POST, HEAD, OPTIONS, GET, CONNECT, TRACE, PATCH } = Coralian.constants.HttpRequestMethod;
const unsupportedOperation = Error.unsupportedOperation;

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
			if (String.contains(str, "Content-Disposition")) {
				let arr = str.split("\r\n");
				let query = {}, files = {};
				let data = [], isFile = false, contentType = null;
				let first = arr[0];
				for (let i = 0, len = arr.length; i < len; i++) {
					let line = arr[i];
					console.log(i, line);
					if (String.isEmpty(line)) continue;
					if (String.startsWith(line, first)) {
						data = [];
						isFile = false;
					} else if (String.startsWith("Content-Disposition")) {

					} else if (String.startsWith("Content-Type")) {

					}
				}
				parse.query = query;
				parse.files = files;
			} else {
				Object.addAll(qs.parse(str), parse.query);
			}

			switch (method) {
				case DELETE: // PUT、DELETE 都采用和 POST 一样的实现
				case PUT:
				case POST:
				// 因为都要调用 request 方法，所以这里 switch 贯穿掉
				case HEAD:
				case OPTIONS: // 这里主要考虑到有跨域请求
				case GET:
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