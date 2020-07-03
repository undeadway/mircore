/*
 * Error Code 与 Error 信息的对照表
 */

const HTTP_STATUS_CODES = require("http").STATUS_CODES;
const HttpStatusCode = Coralian.constants.HttpStatusCode;

const ERR_OBJ = {
	[HttpStatusCode.BAD_REQUEST]: "由于包含语法错误，当前请求无法被服务器理解。", // 400
	[HttpStatusCode.NOT_FOUND]: "请求失败，未在服务器上发现所请求的资源。", // 404
	[HttpStatusCode.REQUEST_TIMEOUT]: "网络请求超时。", // 408
	[HttpStatusCode.URI_TOO_LONG]: "请求的URI长度超过了服务器能够解释的长度，因此服务器拒绝对该请求提供服务。", // 414
	[HttpStatusCode.INTERNAL_SERVER_ERROR]: "服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。", // 500
	[HttpStatusCode.NOT_IMPLEMENTED]: "服务器不支持当前请求所需要的某个功能。", // 501
	[HttpStatusCode.SERVICE_UNAVAILABLE]: "由于服务器维护或者过载，无法处理当前请求。", // 503
	[HttpStatusCode.GATEWAY_TIMEOUT]: "服务器相应超时" // 504
};

this.getError = function (code) {
	return {
		errorcode: code,
		errortitle: HTTP_STATUS_CODES[code],
		errormsg: ERR_OBJ[code]
	};
};