/**
 * 处理 parse 的功能
 */

const url = require("url"), qs = require("querystring");
const file = require("../public/file");
const { STR_BINARY, CONTENT_DISPOSITION, STR_CONTENT_TYPE} = require("./../constants").Strings;

const { DELETE, PUT, POST, HEAD, OPTIONS, GET, CONNECT, TRACE, PATCH } = Coralian.constants.HttpRequestMethod;
const unsupportedOperation = Error.unsupportedOperation;

function parseFormData (str, parse) {

	let query = {}, files = {}; // 全局设置

	let first = str.slice(0, str.indexOf("\r\n")); // 获得第一行（报头样式）
	let arr = str.split(first); // 根据报头样式分割数据

	for (let item of arr) {

		if (String.isEmpty(item)) continue;

		let tmp = item.match(/name="(.+?)"/);
		if (tmp === null) continue;
		let name = tmp[1];
		if (!name) continue;

		if (String.contains(item, STR_CONTENT_TYPE)) {
			if (!/filename="(.+?)"/.test(item)) continue; // 没有文件上传的情况则不做任何处理

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
			let filename = item.match(/filename="(.+?)"/)[1];
			let _file =  file.create({ filename, data });
			if (_file !== null) {
				files[name] = _file;
			}
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
			req.setEncoding(STR_BINARY); // TODO 这里改成 binary 不知道会不会对其他类型的提交造成影响
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
				case DELETE: // PUT 、DELETE 都采用和 POST 一样的实现
				case PUT:
				case POST:
					if (String.contains(str, CONTENT_DISPOSITION)) { // TODO 这里的处理可能还要再分其他情况
						parseFormData(str, parse);
					} else {
						try {
							Object.addAll(JSON.parse(str), parse.query); // 先判断是否是 json 结构
						} catch (e) {
							Object.addAll(qs.parse(str), parse.query);
						}
					}
					request(req, res);
					break;
				// 因为都要调用 request 方法，所以这里 switch 贯穿掉
				case HEAD:
				case OPTIONS: // 这里主要考虑到有跨域请求
					res.writeHead(204, {
						//允许所有来源访问
						'Access-Control-Allow-Origin': '*',
						//用于判断request来自ajax还是传统请求
						"Access-Control-Allow-Headers": " Origin, X-Requested-With, Content-Type, Accept",
						//允许访问的方式
						'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
						//修改程序信息与版本
						'X-Powered-By': ' 3.2.1',
						//内容类型：如果是post请求必须指定这个属性
						'Content-Type': 'application/json;charset=utf-8'
					});
					res.end();
					break;
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