/**
 * controller
 * 内部包含实现了 action
 * 
 * 实现了对业务逻辑的处理
 * 在 之后的调用中，可以获得保存在 controller 中的内容
 * 
 * 通过 controller 可以完成对页面进行渲染、重定向等所有 request 和 response 的操作
 */
const mergeDescriptors = require("merge-descriptors");

const sessions = require("./../components/public/sessions");
const render = require("./../components/private/render");
const { splitMark } = require("../util/app-config");
const { typeIs } = require("coralian/src/common/base");

const { HttpStatusCode, HttpRequestMethod, Char } = JsConst;
const { unsupportedOperation, unsupportedType } = Error;

const {  Strings: { INDEX }, Names: { ACTION } } = require("./../components/constants");

function controller() {

	// 全局变量
	let client, cookies , method, query, files, headers, url;
	// 这些都要经过 juddeExe 才处理后才会赋值
	let realRoute, reqRoute, modName, actionName, reqPath, typeName;
	// 这些都是已经初始化好的值
	let attrs = {}, actions = {}, paras = null; //, isLogged = false;

	const _ctlr_ = {
		/* 
		 * 在 filter 中设置 controller 的初始值
		 * 并返回 true / false 交由 filter 来判断是否继续执行 execute
		 * request: 服务器的请求
		 * response: 服务器的返回值
		 * name：controller 的名字
		 */
		init: function (request, response, header) {

			client = request.client,
			cookies = request.parse.cookies,
			method = request.method.toLowerCase(),
			query = JSON.parse(request.parse.query),
			files = request.parse.files,
			url = request.url,
			headers = request.headers,
			typeName = header.type;

			// 初始化设置
			let { pathname, path, error } = request.parse;

			// 因为每个请求都有对应的 controller 和 action
			// 所以先完成所有 action 和请求参数的预处理
			/**
			 * realRoute = name.path 是对应文件物理路径 : [blog,read]
			 * reqRoute 是浏览器中输入的 url，如果有多层，在取最后一层 : read
			 * modName 是模块名 = 物理路径的第一层 blog
			 * reqPath 是浏览器请求中的完整 url /blog/create?bid=123456
			 */
			reqPath = decodeURIComponent(pathname);
			realRoute = header.route;
			modName = realRoute[0];

			Coralian.logger.log(`request route : ${modName}`);
			if (modName === Error.TYPE_NAME) {
				if ((error && typeIs(error, Number.TYPE_NAME))) {
					Coralian.logger.log(`Error code : ${error}`);
				} else {
					Coralian.logger.err(error);
				}
			}

			if (!error) { // 如果传入的 parse 对象中未包含 error 对象，则正常执行
				path = path.split(Char.QUESTION);
				paras = path[1];
				path = path[0];
				if (!Object.isEmpty(paras)) {
					paras = paras.split(splitMark);
				}

				if (path === Char.SLASH) {
					path += INDEX;
				}

				let url = path.split(Char.SLASH); // 到这里， path 就不含任何 和 路径无关的东西了
				url.shift(); // 去掉一个的空值

				if (String.endsWith(path, Char.SLASH)) {
					url.pop(); // 去掉最后一个空值
				}

				let reqMethod = method;
				let lastUrl = Array.last(url); // 获取 url 中最后一节
				let lastName = Array.last(realRoute);

				if (actions[`${reqMethod}_${lastUrl}`]) { // [route..., action]
					reqRoute = lastName;
					actionName = lastUrl;
				} else if (url.length === 1 // [route]
					|| path === Char.SLASH + realRoute.join(Char.SLASH)) { // [route...] 所请求的不包含 action、paras，只有 route
					reqRoute = lastUrl;
					actionName = INDEX;
				} else { // [...., paras]
					let lastSecond = Array.last(url, 2); // 取得倒数第二个
					if (url.length > 2 && actions[`${reqMethod}_${lastSecond}`]) {  // [route..., action, paras]
						actionName = lastSecond;
					} else { // [route..., paras]
						actionName = INDEX;
					}
					reqRoute = lastName;
					paras = lastUrl.split(splitMark);
				}
			} else {
				actionName = INDEX;
				let err = error;
				switch (typeOf(err)) {
					case Object.TYPE_NAME:
						attrs = err;
						break;
					case Number.TYPE_NAME:
						attrs.code = err;
						break;
					case String.TYPE_NAME:
						let nErr = Math.trunc(err);
						if (typeIs(nErr, Number.NaN_TYPE_NAME)) {
							Error.errorCast(err, Number);
						}
						attrs.code = nErr;
					default:
						Error.unsupportedType(err);
				}
			}

			// 将 render 绑定到 controller
			const _render = render(request, response, reqRoute, typeName, actionName, cookies.res, attrs);
			mergeDescriptors(this, _render);
		},
		// TODO
		// 这个方法或许可以下放到各个子类，
		//controller 基类默认全部通过
		judgeExecute: () => {
			return true;
		},
		/*
		 * 暂时只是对action的处理（包括inspector和之后的执行 action ）
		 */
		execute: function () {
			invokeAction(actions, method, actionName, this);
		},
		// 各种参数处理
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
		isEmptyPara: function () {
			return Object.isEmpty(paras);
		},
		getHeader : (key) => {
			return headers[key];
		},
		getQuery: function (key) {
			if (key) {
				return !!query ? query[key] : null;
			} else {
				return query;
			}
		},
		getQueries: function() {
			return query;
		},
		isEmptyQuery: function () {
			return Object.isEmpty(query);
		},
		setAttr: function (k, v) {

			if (typeIs(k, Function.TYPE_NAME)) {
				v = k;
				k = Function.getName(v);
				if (String.isEmpty(k)) unsupportedOperation("函数名不能为空");

			} else if (v === undefined) {
				v = String.BLANK;
			}

			if (typeIs(v, Object.TYPE_NAME)) {
				let value = attrs[k];
				if (!value) {
					attrs[k] = value = {};
				}
				mergeDescriptors(value, v);
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
			mergeDescriptors(target, obj);
		},
		getAttr: function (k) {
			return attrs[k];
		},
		// Session 处理
		getSession: function (key) {
			return sessions.get(key);
		},
		setSession: function (key, value) {
			sessions.set(key, value);
		},
		// Cookie 处理
		getCookie: function (key) {
			return cookies.req.get(key);
		},
		getFile: (name) => {
			return files[name];
		},
		isEmptyCookie: () => {
			return	cookies.req.isEmpty();
		},
		// 除了获得 cookie ，所有对 cookie 的操作全都是往前台写的 cookie 操作
		setCookies: function (obj) {
			cookies.res.setAll(key);
		},
		setCookie: function (key, value) {
			cookies.res.set(key, value);
		},
		clearCookies: () => {
			cookies.res.clear();
		},
		// 添加 action 用的函数
		// 添加一个对应请求方法的参数，可以 RESTFul 化处理
		addAction: function ({ name, action, method, inspectors }) {

			name = name || INDEX;
			method = method || HttpRequestMethod.GET;
			inspectors = inspectors || [];

			if (typeIs(method, Array.TYPE_NAME)) {
				for (let m of method) {
					m = m.toLowerCase();
					_addAction(actions, `${m}_${name}`, action, inspectors);
				}
			} else {
				method = method.toLowerCase();
				_addAction(actions, `${method}_${name}`, action, inspectors);
			}
		},
		getAction: function (name) {
			return actions[name];
		},
		getActionName: function () {
			return actionName;
		},
		// 重定向，触发 301 / 302（默认） 请求
		redirect: function (code, target) {

			if (target === undefined) {
				target = code;
				code = 302;
			}

			_ctlr_.render(code, String.BLANK, target);
		},
		isIndex: function () {
			return pathName === INDEX || String.isEmpty(pathName);
		},
		method: function (name) {
			return (!name) ? method : (method.toUpperCase() === name.toUpperCase());
		},
		getRequestRoute: function () {
			return reqRoute;
		},
		getTypeName: function () {
			return typeName;
		},
		// TODO 框架中是否要判断登录，待定
		// login: function () {
		// 	isLogged = true;
		// },
		// logout: function () {
		// 	isLogged = false;
		// },
		// isLogged: function () {
		// 	return isLogged;
		// },
		getClientInfo: function (name) {
			return client.get(name);
		},
		getReqRoute: function () {
			return reqRoute;
		},
		getRealRoute: function () {
			return realRoute;
		},
		getReqPath: function () {
			return reqPath;
		},
		getModName: function () {
			return modName;
		},
		getRequestUrl: () => {
			return url;
		}
	};

	return _ctlr_;
}

function _addAction(actions, name, instance, inspectors = []) {

	if (typeIs(inspectors, Object.TYPE_NAME)) {
		inspectors = [inspectors];
	}

	let actionName = Function.getName(instance);

	actions[name] = {
		isAction: String.contains(actionName, ACTION),
		instance: instance,
		inspectors: inspectors,
		getActionName: function () {
			return name;
		}
	};
}

function invokeAction(actions, method, name, ctrler) {

	let action = actions[`${method}_${name}`];

	if (!action) {
		Coralian.logger.err(`Action ${name} 不存在`);
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
			 * 但被替换之后的 action 只能是 get 请求
			 */
			resetAction: function (actionName) {
				if (!typeIs(actionName, String.TYPE_NAME)) unsupportedType(actionName);
				invokeAction(actions, HttpRequestMethod.GET, actionName, ctrler); // 递归调用 invokeAction
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
