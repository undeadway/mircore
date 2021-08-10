/**
 * 处理 parse 的功能
 */

const url = require("url"), qs = require("querystring");
const file = require("../public/file");
const CONTENT_TYPE = "Content-Type";

const { DELETE, PUT, POST, HEAD, OPTIONS, GET, CONNECT, TRACE, PATCH } = Coralian.constants.HttpRequestMethod;
const unsupportedOperation = Error.unsupportedOperation;

function parseFormData (str, parse) {

	let query = {}, files = {}; // 全局设置

	let first = str.slice(0, str.indexOf("\r\n")); // 获得第一行（报头样式）
	let arr = str.split(first); // 根据报头样式分割数据

	for (let i = 1, len = arr.length - 1; i < len; i++) {
		let item = arr[i];

		let name = item.match(/name="(.+?)"/)[1];
		if (!name) continue;

		if (String.contains(item, CONTENT_TYPE)) {
			if (!/filename="(.+?)"/.test(item)) continue;

			let rems = [];

			//根据\r\n分离数据和报头
			for(let j = 0; j < item.length - 2; j++){
				let v = item[j].charCodeAt(0);
				let v2 = item[j + 1].charCodeAt(0);
				if(v === 13 && v2 === 10){
					rems.push(j);
				}
			}

			let data = item.slice(rems[3] + 2, item.length - 2);
			let type = item.slice(rems[3] + 3, rems[4]);
			let filename = item.match(/filename="(.+?)"/)[1];
			files[name] = file.create({ filename, data, type });
		} else {
			let data = item.split("\r\n");
			query[name] = data[data.length - 2];
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
			req.setEncoding("binary");
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