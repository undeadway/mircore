const contollerMapping = require("./../util/controller-mapping");
const parseView = require("../util/page-template");
const caches = require("../server/cache");
const { MimeType, HttpStatusCode, HttpRequestMethod } = Coralian.constants;
const JSONstringify = JSON.stringify;
const fs = require("fs");

function render (req, res,  {reqRoute, typeName, resCookie, attrs}) {
	
	let httpStatusCode = HttpStatusCode.OK;

	function renderOnError(error, code = HttpStatusCode.INTERNAL_SERVER_ERROR) {

		let errorCtrler = contollerMapping.get('/error');
		let ctrler = errorCtrler.instance();

		if (typeIs(error, Number.TYPE_NAME)) {
			let newErr = new Error();
			newErr.code = error;
			req.parse.error = newErr;
		} else {
			error.code = code;
			req.parse.error = error;
		}
		req.method = HttpRequestMethod.GET; // controller 中执行错误页面的时候，改成 get 模式
		if (ctrler.judgeExecute(req, res, errorCtrler.name)) {
			ctrler.execute();
		}
	}

	/*
	 * render 只负责实现 HTML 的显示
	 * 所有 JSON或者其他 plain 形式的显示都交给 plain 函数来实现
	 */
	function render(code, url, location, renderType) {

		if (arguments.length === 1) {
			url = code;
			code = httpStatusCode;
		}
		if (arguments.length === 2 && typeIs(url, Boolean.TYPE_NAME)) {
			renderType = url;
			url = code;
		}

		if (arguments.length === 3 && typeIs(location, Boolean.TYPE_NAME)) {
			renderType = location;
			location = undefined;
		}

		url = String.trim(String(url));

		switch (typeOf(url)) {
			case String.TYPE_NAME:

				/*
				 * 数据类型是 字符串，则认为是一个 可被显示 的 HTML 文件路径
				 * 解析HTML，并将 PARA 中的参数赋值到 页面中
				 */
				let header = {
					"Content-Type": MimeType.HTML,
					"Set-Cookie": resCookie.print()
				}
				let page = String.BLANK;
				let absoluteUrl = pathResolve(url);

				if (location !== undefined) {
					header["Location"] = location;
				}
				res.writeHead(code, header);

				if (fs.existsSync(absoluteUrl)) {
					if (!String.isEmpty(url)) {

						if (!renderType) {
							url = absoluteUrl;
						}

						// 这里的缓存处理只是为了不每次都进行页面模板解析而进行的处理
						if (caches.cacheUsed('page')) {
							let pageCache = caches.get('page');
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
									page = parseView(url, attrs);
									pageCache.save(reqRoute, page);
								} else {
									page = cacheObj;
								}
							} else {
								page = parseView(url, attrs);
							}
						} else {
							page = parseView(url, attrs);
						}
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
	function plain(data, hsc, mime) {
		hsc = hsc || httpStatusCode;
		// 从理论上来说，不管任何形式的 plain 的 mime 都是 text/plain
		// 但 js、css 等有自己单独的 mime，所以 mime 类型可选择，不给就赋默认值的 text/plain
		mime = mime || MimeType.TEXT;
		res.writeHead(hsc, {
			"Content-Type": mime,
			"Set-Cookie": resCookie.print()
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
	 * 提供文件下载用
	 * 现在尚未实现
	 */
	function renderFile(data, hsc, mime) {
		hsc = hsc || httpStatusCode;
		mime = mime || MimeType.OCTET_STREAM;
		res.writeHead(hsc, {
			"Content-Type": mime,
			"Set-Cookie": resCookie.print()
		});
		// 后面的还不会，还要再研究
		end();
	}

	function renderJSON(data, hsc) {
		plain(data, hsc, MimeType.JSON);
	}

	/*
	 * 在这里暂时只做关闭 res 处理，之后再补充其他功能
	 */
	function end() {
		Coralian.logger.log(typeName + ' request end');
		res.end();
	}

	return {
		render,
		renderFile,
		renderJSON,
		renderOnError,
		plain
	}
}

module.exports = exports = render;