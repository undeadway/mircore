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

	return {
		init: (req) => {
			parse = req.parse = url.parse(req.url, true);
			method = req.method = req.method.toUpperCase();
		},
		push: (chunk) => {
			chunks.push(chunk);
			size += chunk.length;
		},
		end: (request) => {
			console.log(chunks.join(String.BLANK));
			Object.addAll(qs.parse(chunks.join(String.BLANK)), parse.query);

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