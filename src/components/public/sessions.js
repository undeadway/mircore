/**
 * Session 类
 * 通过这个类来维持系统中需要提供 session 的功能
 * 每个 session 对象都可以保持30分钟，超过30分钟就会自动对过期处理
 * 每 24 对过期的 session 进行清理
 */
const NUM_TIME_OUT = 1000 * 60 * 30;
const sessions = {};

function session(sid) {

	let timeout, session = {};

	function renew() {
		timeout = Date.now() + NUM_TIME_OUT;
	}
	renew();

	return {
		getSessionId: function () {
			return sid;
		},
		getNames: function () {
			renew();
			return Object.key(session);
		},
		getValue: function (key) {
			renew();
			return session[key];
		},
		putValue: function (key, value) {
			renew();
			session[key] = value;
		},
		removeValue: function (key) {
			renew();
			let value = session[key];
			delete session[key];
			return value;
		},
		hasValue: function (key) {
			return !!session[key];
		},
		isEmpty: () => {
			return Object.isEmpty(session);
		},
		isValid: function () {
			if (timeout === timeout) {
				return timeout < Date.now();
			} else {
				return false;
			}
		},
		getTimeOut: function () {
			return timeout;
		},
		timeout: function () {
			session = null;
			timeout = NaN;
		},
		renew: renew,
		toString: function () {

		}
	};
}

function create() {

	let sid = Date.now();

	sessions[sid] = session(sid);

	return sid;
};

exports.create = create;

exports.has = function (sid) {
	let session = sessions[sid];

	if (session) {
		return session.isValid();
	} else {
		return false;
	}
};

exports.get = function (sid) {

	let session = sessions[sid];

	if (session.isValid()) {
		return session;
	} else {

		clear(session, sid);
		return null;
	}
};

exports.remove = function (sid) {

	let session = sessions[sid];

	return clear(session, sid);
};

function clear(session, sid) {

	session.timeout();

	var obj = sessions[sid];
	delete sessions[sid];

	return obj;
}

// 每天 0 点 清理清理一次 session
(function () {

	let now = new Date();
	let nextZero = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0).getTime(); // 次日零点

	setTimeout(function () {
		setInterval(function () {

			Coralian.logger.log(new Date().toString() + " ：清理垃圾");

			for (let sid in sessions) {
				let session = sessions[sid];
				if (!session.isValid()) {
					clear(session, sid);
				}
			}

			/**
			 * 实际调用 global.gc 的时候会有问题，提示：
			 * TypeError: global.gc is not a function
			 * 也不知道为什么，所以暂时注释掉
			 */
			// TODO
			// global.gc();

		}, 1000 * 60 * 60 * 24);
	}, nextZero - now.getTime());
})();