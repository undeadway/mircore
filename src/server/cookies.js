/**
 * Cookie 的设置
 * 登录从客户端上来的 cookie 以及需要记录到客户端去的 cookie
 * 但从客户端上来的 cookie 和 到 客户端去的 cookie 是两个不同的实例
 * 在 controller 中判断的都是从客户端上去的 cookie
 * 在 controller 中设置的 cookie 都是准备写到客户端去的
 */
var unsupportedType = Error.unsupportedType;
var noReference = Error.noReference;
var asUnicodeEndode = Coralian.util.CharUtil.asUnicodeEncode;

function cookies() {

	var instance = {};

	function add(key, value) {

		if(!typeIs(key, 'string')) unsupportedType(key);
		if(!key || value === null || value === undefined) return;

		if(!typeIs(value, 'string')) {
			value = (value).toString();
		}

		instance[String.trim(key)] = String.trim(value);
	}

	function addAll(input) {
		if(!input) return;

		for(var k in input) {
			if(input.hasOwnProperty(k)) {
				add(k, input[k]);
			}
		}
	}
	addAll(arguments[0]);

	function print() {

		var result = [];

		for(var key in instance) {
			if(instance.hasOwnProperty(key)) {
				var value = instance[key];
				if(!typeIs(value, 'function')) {
					result.push(key + "=" + changeToUnicodeCode(instance[key]));
				} else {
					unsupportedType(value);
				}
			}
		}

		var output = result.join(";");
		return output;
	}

	function setMaxAge(second) {

		if(second === null || second === undefined) return;
		if(!Number.isNumber(second)) unsupportedType(second);

		maxAge = second;

		expire = new Date();

		expire.setTime(expire.getTime() + maxAge * 1000);
	}

	return {
		getValues: function() {
			var result = {};
			addAll(instance, result);
			return result;
		},
		getValue: function(key) {
			return instance[key];
		},
		add: add,
		addFromRequest: function(string) {
			if(string) {
				Object.forEach(string.split(';'), function(i, obj) {
					var tmp = obj.split('=');
					add(tmp[0], tmp[1]);
				});
			}
		},
		addAll: addAll,
		setMaxAge: setMaxAge,
		setPath: function(str) {
			if(str === null || str === undefined) {
				return;
			}
			path = str;
		},
		setCookieTimeout: function() {
			setMaxAge(-1); // 
		},
		toString: print,
		print: print,
		isEmpty: function() {
			return Object.isEmpty(instance);//.isEmpty();
		},
		clear: function() {
			setMaxAge(0);
			instance = {};
		}
	};
}

/*
 * nodejs 升级到6.10.0之后报下面的错
 * TypeError: The header content contains invalid characters
 * 调查之后是在 _http_common.js 的 checkInvalidHeaderChar（303-326）函数执行了一个非ASCII字符的检查。
 * 字符串中存在非ASCII字符的时候，会被 判断为非法字符而被 check 出来，
 * 所以在 check 之前增加这样一段代码，将所有字符都转化成 unicode 码 来避开检查。
 * 
 * 至于为什么会有这么一段恶心的检查，鬼才知道
 */
function changeToUnicodeCode(val) {

	var output = "";
	for(let i = 0; i < val.length; ++i) {
		let c = val.charCodeAt(i);
		if((c <= 31 && c !== 9) || c > 255 || c === 127) {
			output += asUnicodeEndode(c);
		} else {
			output += val.charAt(i);
		}
	}

	return output;
}

module.exports = cookies;
