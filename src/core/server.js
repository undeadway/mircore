/*
 * 服务器基础模块。
 * 接收来自客户端的请求，然后根据，不同的请求作出不同的响应。
 * 预先将 cookie 、session 这些内容都处理掉，然后再交给后面的模块调用
 * 也就是说， server 这里要完成的是 nodejs 没有实现，但是整个应用程序却需要的功能
 * 更接近于服务器的设置
 */
// 系统组件
const url = require("url");
const websocket = require("./../websocket/index");
// mircore 的组件
const Cookies = require("../components/public/cookies");
const parseRequest = require("../components/private/parse-request");
const ClientMap = require("../components/private/client-map");
// 辅助模块
const { port, appName, mode: { develop }, clusterMode } = require("../util/app-config");
const { clientDisAccessable } = require("./../util/private-utils");
const secrecy = require("../components/public/secrecy"); 
// 各种常量
const { HttpStatusCode, Char } = JsConst;
const { formatString } = Coralian.Formatter;
// filter
const filter = require("./filter");
// 服务器配置
const TIMEOUT = 20000,
	ERROR_ROUTE_FORMAT = "/error/%s";
let isStarted = false;

/*
 * 初始化完毕，执行 listen 函数启动 http 服务器
 * 因为 nodejs 实现了 http 服务器，所以不用自己实现相关功能
 * 这个函数只会在初始化服务器的时候才会调用一次
 */
function listen(name) {
	const httpServer = require("http").createServer(router);
	httpServer.listen(port);
	Coralian.logger.log(`${name} Server started`);

	websocket.create(httpServer);
}

/*
 * 服务器响应执行函数
 * 所有相应都由这个函数来执行
 * 每次请求都会由这个函数来具体分配各种路由操作
 */
function router(req, res) {

	let __parse = parseRequest();

	setClientInfo(req);

	if (clientDisAccessable(req.client.get("USERAGENT"))) { // 客户端被拒绝，返回403
		res.writeHead(403);
		res.end();
		return;
	} else {
		__parse.init(req, res);
		req.on("data", function (chunk) {
				__parse.append(chunk);
			}).on("end", () => {
				__parse.end(request);
			})
			.setTimeout(TIMEOUT, function () {
				if (develop) return; // 开发模式的情况下，无视各种超时
				// req 请求超时，网络不稳定
				// 408 Request Timeout
				Coralian.logger.err(`request 请求错误: ${HttpStatusCode.REQUEST_TIMEOUT}`);
				req.url = formatString(ERROR_ROUTE_FORMAT, HttpStatusCode.REQUEST_TIMEOUT);
				req.parse = url.parse(req.url, true);
				request(req, res);
			})
			.on(Error.TYPE_NAME, onError);
		res.on(Error.TYPE_NAME, onError)
			.setTimeout(TIMEOUT, function () {
				if (develop) return; // 开发模式的情况下，无视各种超时
				// res 响应超时，服务器无应答
				// 504 Gateway Timeout
				Coralian.logger.err(`response 返信错误: ${HttpStatusCode.REQUEST_TIMEOUT}`);
				req.url = formatString(ERROR_ROUTE_FORMAT, HttpStatusCode.GATEWAY_TIMEOUT);
				req.parse = url.parse(req.url, true);
				request(req, res);
			});
	}

	/*
	 * 错误相应函数
	 * 发生错误的时候，调用这个错误来进行捕获
	 * 但这个函数已经是服务器层级的捕获，虽然能捕获相关错误，但并不解决错误
	 * 只是将错误显示在最终页面上，返回给用户
	 */
	function onError(err) {
		// 请求（或响应）发生错误的时候，如果内部任何一层都未能捕获，则在最外层捕获
		Coralian.logger.err("HTTP request error : ");
		Coralian.logger.err(err.code);
		Coralian.logger.err(err.stack);

		// 如果发生 write after end ，则只将错误信息记录到 log 中去
		if (String.contains(err.message, "write after end")) return;

		req.url = formatString(ERROR_ROUTE_FORMAT, (err.code || HttpStatusCode.INTERNAL_SERVER_ERROR));
		req.parse = url.parse(req.url, true);
		request(req, res);
	}
}

/*
 * 请求处理函数
 * 由客户端发起的，不管是何种方法的请求，都要经过这个函数来进行初步的处理，才能向下转发
 */
function request(req, res) {

	let parse = secrecy.decrypt(req.parse),
		cookies = Cookies.createRequestCookies();
	cookies.addFromRequest(req.headers.cookie);

	parse.cookies = {req: cookies, res: Cookies.createResponseCookies()};

	filter(req, res);
}

/*
 * 调用这个函数获得客户端的一些初始化信息
 * 这一块想写到 inspector 里面去，但暂时写不好
 */
function setClientInfo(req) {

	ClientMap.newInstance(req);

	initUserAgendAndOS(req);
	initClientIp(req);
}

function initUserAgendAndOS({ headers, client, url }) {

	let input = getUserAgent(headers);
	let userAgent, os;

	if (String.contains(input, "windows")) {
		os = "Windows";
	} else if (String.contains(input, "linux")) {
		os = "Linux";
	} else if (String.contains(input, "sun") || String.contains(input, "solaris")) {
		os = "Solaris"
	} else if (String.contains(input, "android")) {
		os = "Android";
	} else if (String.contains(input, "iphone") || String.contains(input, "ipad") || String.contains(input, "apple")) {
		os = "iOS";
	} else {
		os = "Unknown";
	}

	if (String.contains(input, "trident") || String.contains(input, "microsoft") ||
		(String.contains(input, "ie") && os === "Windows")) // 为避免 ua 中含有 “ie” 字符串造成的歧义，加上操作系统名限制
	{
		userAgent = "IE";
	} else if (String.contains(input, "edge")) {
		userAgent = "Edge";
	} else if (String.contains(input, "micromessenger") || String.contains(input, "micromsg") || String.contains(input, "weixin") || String.contains(input, "wechat")) {
		userAgent = "Wechat";
	} else if (String.contains(input, "opr")) {
		userAgent = "Opera";
	} else if (String.contains(input, "chrome")) {
		userAgent = "Chrome";
	} else if (String.contains(input, "safari")) {
		userAgent = "Safari";
	} else if (String.contains(input, "apple")) {
		userAgent = "Safari";
	} else if (String.contains(input, "gekko") || String.contains(input, "quantum") || String.contains(input, "mozilla")) {
		userAgent = "Firefox";
	} else if (String.contains(input, "curl")) {
		userAgent = "curl";
	} else {
		userAgent = "Unknown";
	}

	client.put("USERAGENT", userAgent);
	client.put("OS", os);

	Coralian.logger.log("A Request OS : " + os);
	Coralian.logger.log(" Request url :" + url);
	Coralian.logger.log("  User Agnet : " + userAgent);
}

function initClientIp(req) {
	let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;
	req.client.put("IP", ip);

	Coralian.logger.log("          IP : " + ip);
};

/*
 * 获取user-agnet
 * 如果没有得到 user-agent，则赋值为 unknown
 */
function getUserAgent(header) {

	let userAgent = header["user-agent"];

	userAgent = userAgent || "unknown";
	return userAgent.toLowerCase();
}

/*
 * 整个程序的启动函数
 * 这里主要是针对操作系统进行的一些设置和配置
 */
module.exports = exports = () => {

	if (isStarted) return;
	isStarted = true;

	/*
	 * 这里用来捕获进程级错误，只将错误信息打印出来，但不具体解决错误
	 * 理论上到这里的时候，所有错误都应该已经被解决
	 * 这里捕捉到的错误都是隐藏的比较深的bug触发的
	 */
	process.on("uncaughtException", (err) => {
		Coralian.logger.log("程序发生未捕获异常！");
		Coralian.logger.err(err);
	})

	if (clusterMode && !develop) {
		/*
		 * 这段代码当时是从网上抄来的，据说对服务器稳定有好处
		 * 但从实际运行来看，好像没什么变化，暂时保留
		 */
		let cluster = require("cluster");

		if (cluster.isMaster) {
			process.title = `${appName} master`;
			Coralian.logger.log(process.title, `${Char.SHARP}${process.pid}`, "started");

			// 根据 CPU 个数来启动相应数量的 worker
			for (let i = 0, numCPUs = require("os").cpus().length; i < numCPUs; i++) {
				cluster.fork();
			}

			process.on("SIGHUP", function () {
				// master 进程忽略 SIGHUP 信号
			});

			cluster.on("online", function (worker) {
				Coralian.logger.log(`Worker ${worker.process.pid} is online`);
			});

			cluster.on("exit", function (worker, code, signal) {
				Coralian.logger.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
				Coralian.logger.log("Starting a new worker");
				cluster.fork();
			});

			cluster.on("death", function (worker) {
				Coralian.logger.log(appName, "worker",`${Char.SHARP}${worker.pid}`, "died");
				cluster.fork();
			}).on("error", function () {
				Coralian.logger.log(arguments);
			});
		} else {
			process.title = `${appName} worker ${process.env.NODE_WORKER_ID}`;

			process.on("SIGHUP", function () {
				// 接收到 SIGHUP 信号时，关闭 worker
				process.exit(0);
			});

			listen(process.title, `${Char.SHARP}${process.pid}`);
		}
	} else {
		listen(appName); // 开发模式或者非集群模式下，简化所有配置，直接启动服务器
	}
}
