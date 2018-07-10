/*
 * Error Code 与 Error 信息的对照表
 */

var HTTP_STATUS_CODES = require("http").STATUS_CODES;

var ERR_OBJ = {
	"400": "由于包含语法错误，当前请求无法被服务器理解。",
	"404": "请求失败，未在服务器上发现所请求的资源。",
	"408": "网络请求超时。",
	"414": "请求的URI长度超过了服务器能够解释的长度，因此服务器拒绝对该请求提供服务。",
	"500": "服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。",
	"501": "服务器不支持当前请求所需要的某个功能。",
	"503": "由于服务器维护或者过载，无法处理当前请求。",
	"504": "服务器相应超时"
};

this.getError = function(code) {
	return {
		errorcode: code,
		errortitle: HTTP_STATUS_CODES[code],
		errormsg: ERR_OBJ[code]
	};
};