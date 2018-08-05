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
	QUESTION = "?",
	INDEX_ROUTE = SLASH + INDEX;

var getError = require("../error/errorconfig").getError;
var parseview = require("../util/parse_view");
var cookies = require("../server/cookies");
var sessions = require("../server/sessions");
let caches = require("../server/cache");
let { split, developMode, getRoute } = require("../config/app");

let MimeType = Coralian.constants.MimeType,
	htmlEscape = Coralian.ReplaceHolder.htmlEscape,
	isNumber = Number.isNumber;
let {addAll, isEmpty} = Object;
let {unsupportedOperation, unsupportedType } = Error;
let JSONstringify = JSON.stringify;
let EMPTY_STRING = String.BLANK;
let HttpStatusCode = Coralian.constants.HttpStatusCode;

let errorCtrler = null;

function controller() {

	// 这些都要经过 juddeExe 才处理后才会赋值
	var req, res, parse, method, query, route, reqRoute, typeName, pathName, actionName, reqCookie, client;
	// 这些都是已经初始化好的值
	var attrs = {},
		actions = {},
		httpStatusCode = HttpStatusCode.OK,
		paras = EMPTY_STRING,
		isLogged = false,
		resCookie = cookies();

	function renderOnError(error, code = HttpStatusCode.INTERNAL_SERVER_ERROR) {

		if (errorCtrler === null) {
			let instance = require("../error/controller")
			errorCtrler = {
				instance, name: {
					route: ['error'],
					type: instance.getName()
				}
			};
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

		url = url.trim();

		switch (typeOf(url)) {
			case 'string':
				/*
				 * 数据类型是 字符串，则认为是一个 可被显示 的 HTML 文件路径
				 * 解析HTML，并将 PARA 中的参数赋值到 页面中
				 */
				let header =  {
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

			query = parse.query, reqCookie = parse.cookies, reqRoute = parse.pathname, client = req.client;
			route = name.route.join(SLASH), typeName = name.type, pathName = name.path;

			if (name.route === 'error' || parse.error) {
				Coralian.logger.err("request route : " + name.route);
			} else {
				Coralian.logger.log("request route : " + name.route);
			}

			var notOnError = !parse.error;

			if (notOnError) { // 如果传入的 parse 对象中未包含 error 对象，则正常执行
				var path = reqRoute.slice(1); // 去掉最前面的 “/”
				if (path.isEmpty()) {
					path = INDEX;
				}

				var question = path.indexOf(QUESTION);
				if (0 < question) {
					path = path.slice(0, question);
				}
				// 到这里， path 就不含任何 和 路径无关的东西了
				var url = path.split(SLASH);

				var lastUrl = url.last(),
					lastName = name.route.last();
				if (lastUrl === lastName || getRoute("/" + lastUrl) === ("/" + lastName)) { // 所请求的不包含 action、para，只有 route
					actionName = INDEX;
				} else {
					if (actions[lastUrl]) { // 取得 [route..., action]
						actionName = lastUrl;
					} else { // 否则为 [route..., action, para]
						actionName = url.last(2);
						paras = lastUrl;
						if (!actions[actionName]) {	// 最后为[route..., para]
							actionName = INDEX;
						}
					}
				}
				paras = paras.split(split);
			} else {
				actionName = INDEX;
				let err = parse.error;
				switch (typeOf(err)) {
					case 'object' :
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
					default :
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
			return paras;
		},
		getPara: function (index) {
			var para = paras[index];
			if (para === null || para === undefined) {
				return para;
			}
			return decodeURIComponent(para);
		},
		getQuery: function (key) {
			return !!query ? query[key] : null;
		},
		setAttr: function (k, v) {

			if ('function' === typeof k) {
				v = k;
				k = v.getName();
				if (k.isEmpty()) unsupportedOperation('函数名不能为空');

			} else if (v === undefined) {
				v = EMPTY_STRING;
			}

			if (typeIs(v, 'object')) {
				var value = attrs[k];
				if (!value) {
					attrs[k] = value = {};
				}
				Object.addAll(v, value);
			} else {
				attrs[k] = v;
			}
		},
		setAttrs: function (name, obj) {
			var target;
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
			return reqCookie.isEmpty();
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
					name = action.getName().replace("Action", "");
					break;
				case 2:
					if (typeof name === "function") { // [name, action]
						inspectors = action;
						action = name;
						name = action.getName().replace("Action", "");
					} // [action, inspectors]
					break;
				case 3:
					break;
				default :
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

			render(code, EMPTY_STRING, location);
		},
		isIndex: function () {
			return route === INDEX_ROUTE || route === SLASH;
		},
		method: function (get) {
			return (!get) ? method : (method.toUpperCase() === get.toUpperCase());
		},
		getRoute: function () {
			return route;
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
		getPathName: function () {
			return pathName;
		}
	};
}

function addAction(actions, name, instance, inspectors) {

	if (typeIs(inspectors, 'object')) {
		inspectors = [inspectors];
	}

	let actionName = instance.getName();

	actions[name] = {
		isAction : instance.getName().contains("Action"),
		instance: instance,
		inspectors: inspectors || [],
		getActionName: function () {
			return name;
		}
	};
}

function invokeAction(actions, name, ctrler) {

	var action = actions[name];

	if (!action) {
		Coralian.logger.err(`Action ${name} not exists.`);
		ctrler.renderOnError(HttpStatusCode.NOT_FOUND);
		return;
	}

	var inspectors = action.inspectors || [];
	var count = inspectors.length,
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
