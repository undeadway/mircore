/**
 * 把渲染处理独立出来
 * 作为一个单独的模块
 */
const fs = require("fs");
const imageinfo = require("imageinfo");
const contollerMapping = require("../util/controller-mapping");
const pageTemplate = require("../util/page-template");
const caches = require("../server/cache");
const { MimeType, Mark, HttpStatusCode } = Coralian.constants;
const HTTP_REQUEST_METHOD_GET = Coralian.constants.HttpRequestMethod.GET;
const JSONstringify = JSON.stringify;
const ROUTE_ERROR = "/error";
const STR_BINARY = "binary";

function render (req, res, {reqRoute, typeName, cookies, attrs}) {

	/*
	 * render 只负责实现 HTML 的显示
	 * 所有 JSON或者其他 plain 形式的显示都交给 plain 函数来实现
	 */
	function render({code = HttpStatusCode.OK, url, location}) {

		url = String.trim(String(url));

		switch (typeOf(url)) {
			case String.TYPE_NAME:

				/*
				 * 数据类型是 字符串，则认为是一个 可被显示 的 HTML 文件路径
				 * 解析HTML，并将 PARA 中的参数赋值到 页面中
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

				if (fs.existsSync(absoluteUrl)) {

					url = absoluteUrl;

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
	function plain(data, hsc, mime) {
		hsc = hsc || httpStatusCode;
		// 从理论上来说，不管任何形式的 plain 的 mime 都是 text/plain
		// 但 js、css 等有自己单独的 mime，所以 mime 类型可选择，不给就赋默认值的 text/plain
		mime = mime || MimeType.TEXT;
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
		Coralian.logger.log(typeName + ' request end');
		res.end();
	}

	return {
		render,
		/*
		 * 提供文件下载用
		 * 目前只能准确判断是否是图片，其余类型尚无准确的判断方法
		 */
		renderFile: ({file, name, mime =  MimeType.OCTET_STREAM}) => {
			if (typeIs(file, String.TYPE_NAME)) {
				let url = pathResolve(file);
				file = fs.readFileSync(url, STR_BINARY);
				name = name || url.split(Mark.SLASH).pop();
			}
			let imgInfo = imageinfo(file);
	
			if (imgInfo) { // 判断是否是图片
				mime = imgInfo.mimeType;
			}
	
			res.writeHead(HttpStatusCode.OK, {
				"Content-Type": mime,
				'Content-Disposition': `attachment;filename=${name}`,
				"Set-Cookie": cookies.print()
			});
			res.write(file, STR_BINARY);
			end();
		},
		/*
		 * 输出错误页面
		 */
		renderOnError: (error, code = HttpStatusCode.INTERNAL_SERVER_ERROR) => {

			let errorCtrler = contollerMapping.get(ROUTE_ERROR);
			let ctrler = errorCtrler.instance();
	
			if (typeIs(error, Number.TYPE_NAME)) {
				let newErr = new Error();
				newErr.code = error;
				req.parse.error = newErr;
			} else {
				error.code = code;
				req.parse.error = error;
			}
			req.method = HTTP_REQUEST_METHOD_GET; // controller 中执行错误页面的时候，改成 get 模式
			if (ctrler.judgeExecute(req, res, errorCtrler.name)) {
				ctrler.execute();
			}
		},
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