/**
 * 把渲染处理独立出来
 * 作为一个单独的模块
 */
// const fs = require("fs");
const contollerMapping = require("./../../util/controller-mapping");
const pageTemplate = require("../public/page-template");
const caches = require("../public/cache");
const _File = require("../public/file");
const { MimeType,  HttpStatusCode, HttpRequestMethod } = JsConst;
const JSONstringify = JSON.stringify;
const ROUTE_ERROR = "/error";
const { STR_BINARY } = require("./../constants").Strings;

function render (req, res, reqRoute, typeName, actionName, cookies, attrs) {

	/*
	 * render 只负责实现 HTML 的显示
	 * 所有 JSON 或者其他 plain 形式的显示都交给 plain 函数来实现
	 */
	function render({code = HttpStatusCode.OK, url, location}) {

		url = String.trim(String(url));

		switch (typeOf(url)) {
			case String.TYPE_NAME:

				/*
				 * 数据类型是 字符串，则认为是一个 可被显示 的 HTML 文件路径
				 * 解析 HTML ，并将 para 中的参数赋值到页面中
				 */
				let header = {
					"Content-Type": MimeType.HTML,
					"Set-Cookie": cookies.print()
				}
				let page = String.BLANK;
				let absoluteUrl = pathResolve(url);

				if (location !== undefined) {
					header["Location"] = location;
				}
				res.writeHead(code, header);

				// try {
				if (_File.canAccess(absoluteUrl)) {
					// fs.accessSync(absoluteUrl, fs.constants.R_OK);

					url = absoluteUrl;

					// 这里的缓存处理只是为了不每次都进行页面模板解析而进行的处理
					if (caches.cacheUsed("page")) {
						let pageCache = caches.get("page");
						/*
						* 判断使用 cache 的标准
						* 1. cache 必须打开（被定义）
						* 2. cache 必须至少有一个定义值
						* 3. cache 内必须有可对应的route
						*/
						if (pageCache !== null && pageCache.isUsed(reqRoute)) {
							Coralian.logger.log(reqRoute + " use page cache.");
							let cacheObj = pageCache.get(reqRoute);
							if (!cacheObj) {
								page = pageTemplate(url, attrs);
								pageCache.save(reqRoute, page);
							} else {
								page = cacheObj;
							}
						} else {
							page = pageTemplate(url, attrs);
						}
					} else {
						page = pageTemplate(url, attrs);
					}
				} else {
					page = url; // 如果不存在对应的文件，则把该请求的内容直接显示在页面上
				}
				res.write(page);
				break;
			case Function.TYPE_NAME: // 单数类型是是函数，则认为是回调函数，并执行该回调函数
				url(res);
				break;
			case Object.TYPE_NAME: // 如果传入的 url 是个对象，则判断为 ajax 请求的返回结果
				plain(url);
				return; // 因为 plain 已经有 end 了，所以这里直接 return
			default:
				unsupportedType(url);
		}
		end();
	}

	/*
	 * 页面直接打印的内容（现阶段基本用于 ajax）
	 */
	function plain(data = String.BLANK, hsc = 200, mime = MimeType.TEXT) {
		// 从理论上来说，不管任何形式的 plain 的 mime 都是 text/plain
		// 但 js、css 等有自己单独的 mime，所以 mime 类型可选择，不给就赋默认值的 text/plain
		res.writeHead(hsc, {
			"Content-Type": mime,
			"Set-Cookie": cookies.print()
		});
		switch (typeOf(data)) {
			case Object.TYPE_NAME:
			case Array.TYPE_NAME:
				data = JSONstringify(data);
				break;
			case RegExp.TYPE_NAME:
				data = data.toString();
				break;
			case Function.TYPE_NAME:
				unsupportedType(data);
				break;
			default:
				/*
				 * 除上述类型外，其他类型（字符串、数字、布尔变量、null、undefined）
				 * 都直接将字面量打印出来，并不区分类型
				 */
				break;
		}
		res.write(data);
		end();
	}

	/*
	 * 在这里暂时只做关闭 res 处理，之后再补充其他功能
	 */
	function end() {
		Coralian.logger.log(`${typeName}.${actionName} request end`);
		res.end();
	}

	function renderOnError (error, code = HttpStatusCode.INTERNAL_SERVER_ERROR) {

		let errorCtrler = contollerMapping.get(ROUTE_ERROR);
		let ctrler = errorCtrler.instance();
		ctrler.init(req, res, errorCtrler.header);

		if (typeIs(error, Number.TYPE_NAME)) {
			let newErr = new Error();
			newErr.code = error;
			req.parse.error = newErr;
		} else {
			error.code = code;
			req.parse.error = error;
		}
		req.method = HttpRequestMethod.GET; // controller 中执行错误页面的时候，改成 get 模式
		if (ctrler.judgeExecute()) {
			ctrler.execute();
		}
	}

	return {
		render,
		/*
		 * 提供文件下载用
		 */
		renderFile: (input, extObj) => {

			let _file = _File.isFile(input) ? input: _File.create(input, extObj);

			if (_file === null) {
				renderOnError(404);
				return;
			}

			let fileData = _file.getBinaryData(),
				fileName = _file.getFileName(),
				mime = _file.getMime();

			// 如果在没有 mime 的情况下，则提供 Content-Disposition 直接下载文件
			let contentDisposition = mime ? String.BLANK : `attachment;filename=${fileName}`;

			res.writeHead(HttpStatusCode.OK, {
				"Content-Type": mime,
				"Content-Disposition": contentDisposition,
				"Set-Cookie": cookies.print()
			});
			res.write(fileData, STR_BINARY);

			end();
		},
		/*
		 * 输出错误页面
		 */
		renderOnError: renderOnError,
		/*
		 * JSON 输出
		 */
		renderJSON: (data) => {
			plain(data, HttpStatusCode.OK, MimeType.JSON);
		},
		plain
	}
}

module.exports = exports = render;