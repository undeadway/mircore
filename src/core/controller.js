/**
 * controller
 * 内部包含实现了 action
 * 
 * 实现了对业务逻辑的处理
 * 在 之后的调用中，可以获得保存在 controller 中的内容
 * 
 * 通过 controller 可以完成对页面进行渲染、重定向等所有 request 和 response 的操作
 */
const INDEX = 'index',
	SLASH = "/",
	QUESTION = "?";

const parseview = require("../util/parse_view");
const cookies = require("../server/cookies");
const sessions = require("../server/sessions");
const caches = require("../server/cache");
const { split } = require("../config/app");
const ERROR_CTRLER_WRAPPER = require("./../util/config").getControllerWrapper();

const { MimeType, HttpStatusCode } = Coralian.constants;
const { addAll } = Object;
const { unsupportedOperation, unsupportedType } = Error;

const JSONstringify = JSON.stringify;

let errorCtrler = null;

function controller() {

	// 这些都要经过 juddeExe 才处理后才会赋值
	let req, res, parse, method, query, realRoute, reqRoute, typeName, modName, actionName, reqCookie, client, reqPath;
	// 这些都是已经初始化好的值
	let attrs = {},
		actions = {},
		httpStatusCode = HttpStatusCode.OK,
		paras = null,
		isLogged = false,
		resCookie = cookies();

	function renderOnError(error, code = HttpStatusCode.INTERNAL_SERVER_ERROR) {

		console.log(new Error().stack);

		if (errorCtrler === null) {
			errorCtrler = ERROR_CTRLER_WRAPPER;
		}

		let ctrler = errorCtrler.instance();
		if (typeIs(error, 'number')) {
			let newErr = new Error();
			newErr.code = error;
			req.parse.error = newErr;
		} else {
			error.code = code;
			req.parse.error = error;
		}
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
		if (arguments.length === 2 && typeIs(url, 'boolean')) {
			renderType = url;
			url = code;
		}

		if (arguments.length === 3 && typeIs(location, 'boolean')) {
			renderType = location;
			location = undefined;
		}

		url = String.trim(url);

		switch (typeOf(url)) {
			case 'string':
				/*
				 * 数据类型是 字符串，则认为是一个 可被显示 的 HTML 文件路径
				 * 解析HTML，并将 PARA 中的参数赋值到 页面中
				 */
				let header = {
					"Content-Type": MimeType.HTML,
					"Set-Cookie": resCookie.print()
				}
				if (location !== undefined) {
					header["Location"] = location;
				}
				res.writeHead(code, header);

				if (!String.isEmpty(url)) {

					if (!renderType) {
						url = pathResolve(url);
					}

					// 这里的缓存处理只是为了不每次都进行页面模板解析而进行的处理
					let page = null;
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
								page = parseview(url, attrs);
								pageCache.save(reqRoute, page);
							} else {
								page = cacheObj;
							}
						} else {
							page = parseview(url, attrs);
						}
					} else {
						page = parseview(url, attrs);
					}
					res.write(page);
				}

				break;
			case 'function': // 单数类型是是函数，则认为是回调函数，并执行该回调函数
				url(res);
				break;
			case 'object': // 如果传入的 url 是个 对象，则判断为 ajax 请求的返回结果
				plain(url);
				return;
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
			case 'object':
			case 'array':
				data = JSONstringify(data);
				break;
			case 'regexp':
				data = data.toString();
				break;
			case 'function':
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
		/* 
		 * 在 filter 中设置 controller 的初始值
		 * 并返回 true / false 交由 filter 来判断是否继续执行 execute
		 */
		judgeExecute: function (request, response, name) {

			// 初期设置
			req = request, res = response;
			parse = req.parse, method = req.method;
			query = parse.query, reqCookie = parse.cookies, typeName = name.type, client = req.client;

			// reqRoute = reqRoute.slice(1); // 去掉最前面的 “/”
			// if (String.isEmpty(reqRoute)) {
			// 	reqRoute = INDEX; // 首页的时候，将 空 修正为 index
			// }

			/**
			 * realRoute = name.path 是对应文件物理路径 : [blog,read]
			 * reqRoute 是浏览器中输入的 url，如果有多层，在取最后一层 : read
			 * modName 是模块名 = 物理路径的第一层 blog
			 * reqPath 是浏览器请求中的完整 url /blog/create?bid=123456
			 */
			reqPath = parse.pathname;
			realRoute = name.route;
			modName = realRoute[0];

			if (modName === 'error' || parse.error) {
				Coralian.logger.err("request route : " + modName);
				Coralian.logger.err(parse.error);
			} else {
				Coralian.logger.log("request route : " + modName);
			}

			if (!parse.error) { // 如果传入的 parse 对象中未包含 error 对象，则正常执行
				let path = reqPath.split(QUESTION);
				paras = path[1];
				path = path[0];
				if (!Object.isEmpty(paras)) {
					paras = paras.split(split);
				}

				if (path === SLASH) {
					path += INDEX;
				}

				let url = path.split("/"); // 到这里， path 就不含任何 和 路径无关的东西了
				url.shift(); // 去掉一个的空值

				let lastUrl = Array.last(url); // 获取 url 中最后一个
				let lastName = Array.last(realRoute);

				if (actions[lastUrl]) { // [route..., action]
					reqRoute = lastName;
					actionName = lastUrl;
				} else if (url.length === 1 // [route]
					|| path === SLASH + realRoute.join(SLASH)) { // [route...] 所请求的不包含 action、paras，只有 route
					reqRoute = lastUrl;
					actionName = INDEX;
				} else { // [...., paras]
					let lastSecond = Array.last(url, 2); // 取得倒数第二个
					if (url.length > 2 && actions[lastSecond]) {  // [route..., action, paras]
						actionName = lastSecond;
					} else { // [route..., paras]
						actionName = INDEX;
					}
					reqRoute = lastName;
					paras = lastUrl.split(split);
				}
			} else {
				actionName = INDEX;
				let err = parse.error;
				switch (typeOf(err)) {
					case 'object':
						attrs = err;
						break;
					case 'number':
						attrs.code = err;
						break;
					case 'string':
						let nErr = Math.trunc(err);
						if (typeIs(nErr, 'NaN')) {
							Error.errorCast(err, Number);
						}
						attrs.code = nErr;
					default:
						Error.unsupportedType(err);
				}
			}

			return true;
		},
		/*
		 * 暂时只是对action的处理（包括inspector和之后的执行 action
		 */
		execute: function () {
			invokeAction(actions, actionName, this);
		},
		render: render,
		renderOnError: renderOnError,
		plain: plain,
		renderFile: renderFile,
		renderJSON: renderJSON,
		end: end,
		// 获得数组形式的 para
		getParas: function () {
			if (!paras) {
				paras = [];
			}
			return paras;
		},
		getPara: function (index = 0) {
			if (!paras) {
				paras = [];
			}
			let para = paras[index];
			if (para === null || para === undefined) {
				return null;
			}
			return decodeURIComponent(para);
		},
		getQuery: function (key) {
			if (key) {
				return !!query ? query[key] : null;
			} else {
				return query;
			}
		},
		setAttr: function (k, v) {

			if (typeIs(k, 'function')) {
				v = k;
				k = Function.getName(v);
				if (String.isEmpty(k)) unsupportedOperation('函数名不能为空');

			} else if (v === undefined) {
				v = String.BLANK;
			}

			if (typeIs(v, 'object')) {
				let value = attrs[k];
				if (!value) {
					attrs[k] = value = {};
				}
				Object.addAll(v, value);
			} else {
				attrs[k] = v;
			}
		},
		setAttrs: function (name, obj) {
			let target;
			if (arguments.length === 1) {
				target = attrs;
				obj = name;
			} else {
				target = attrs[name];
				if (!target) {
					attrs[name] = target = {};
				}
			}
			addAll(obj, target);
		},
		getAttr: function (k) {
			return attrs[k];
		},
		getSession: function (key) {
			return sessions.get(key);
		},
		setSession: function (key, value) {
			sessions.set(key, value);
		},
		getCookie: function (key) {
			return reqCookie.getValue(key);
		},
		// 这个方法是专门将有需要的 cookies 写到 前台去的
		writeCookies: function (object) {
			resCookie.addAll(object);
		},
		clearCookies: function () {
			resCookie.clear();
		},
		setCookies: function (obj) {
			resCookie.addAll(obj);
		},
		setCookie: function (key, value) {
			resCookie.add(key, value);
		},
		isEmptyQuery: function () {
			return Object.isEmpty(query);
		},
		isEmptyCookie: function () {
			return Object.isEmpty(reqCookie);
		},
		isEmptyPara: function () {
			return Object.isEmpty(paras);
		},
		// 添加 action 用的函数
		addAction: function (name, action, inspectors) {

			switch (arguments.length) {
				case 1:
					// [action]
					action = name;
					name = Function.getName(action).replace("Action", "");
					break;
				case 2:
					if (typeof name === "function") { // [name, action]
						inspectors = action;
						action = name;
						name = Function.getName(action).replace("Action", "");
					} // [action, inspectors]
					break;
				case 3:
					break;
				default:
					break;
			}
			name = name || INDEX;
			addAction(actions, name, action, inspectors);
		},
		getAction: function (name) {
			return actions[name];
		},
		getActionName: function () {
			return actionName;
		},
		// 重定向，触发 301 / 302（默认） 请求
		redirect: function (code, location) {

			if (arguments.length === 1) {
				location = code;
				code = 302;
			}

			render(code, String.BLANK, location);
		},
		isIndex: function () {
			return pathName === INDEX || String.isEmpty(pathName);
		},
		method: function (get) {
			return (!get) ? method : (method.toUpperCase() === get.toUpperCase());
		},
		getRequestRoute: function () {
			return reqRoute;
		},
		getTypeName: function () {
			return typeName;
		},
		login: function () {
			isLogged = true;
		},
		logout: function () {
			isLogged = false;
		},
		isLogged: function () {
			return isLogged;
		},
		getClientInfo: function (name) {
			return client[name.toUpperCase()];
		},
		getReqRoute: function () {
			return reqRoute;
		},
		getRealRoute: function () {
			return realRoute;
		},
		getModName: function () {
			return modName;
		}
	};
}

function addAction(actions, name, instance, inspectors) {

	if (typeIs(inspectors, 'object')) {
		inspectors = [inspectors];
	}

	let actionName = Function.getName(instance);

	actions[name] = {
		isAction: String.contains(actionName, "Action"),
		instance: instance,
		inspectors: inspectors || [],
		getActionName: function () {
			return name;
		}
	};
}

function invokeAction(actions, name, ctrler) {

	let action = actions[name];

	if (!action) {
		Coralian.logger.err(`Action ${name} not exists.`);
		ctrler.renderOnError(HttpStatusCode.NOT_FOUND);
		return;
	}

	let inspectors = action.inspectors || [];
	let count = inspectors.length,
		index = 0;

	function end() {
		index = count + 1;
	}

	try {
		({ // 这里的对象就是 ActionInvocation
			/**
			 * ActionInvocation的主执行逻辑
			 * 外部接口就调用这个方法来执行 invocation
			 */
			execute: function () {
				if (index < count) { // 执行递归，进行下一轮检查
					inspectors[index++].inspect(this);
				} else if (index++ === count) { // 当inspector 都执行完毕后，执行 action
					if (action.isAction) {
						let instance = action.instance();
						instance.invoke(ctrler);
					} else {
						action.instance();
					}
					end();
				}
			},
			/**
			 * 当目标请求的 action 被逻辑拒绝的时候，调用这个方法来更替 action
			 */
			resetAction: function (actionName) {
				if (!typeIs(actionName, 'string')) unsupportedType(actionName);
				invokeAction(actions, actionName, ctrler); // 递归调用 invokeAction
				end();
			},
			getController: function () {
				return ctrler;
			},
			/**
			 * 重定向，会触发 HTTP 的 302 请求
			 */
			redirect: ctrler.redirect,
			/**
			 *  强制结束 ai 递归调用的函数
			 */
			end: end
		}).execute();
	} catch (e) {
		e.code = HttpStatusCode.INTERNAL_SERVER_ERROR;
		ctrler.renderOnError(e);
	}
}

module.exports = exports = controller;
