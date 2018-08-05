/**
 * 解析 VIEW
 * ${name} 解析最基本的元素
 * #{name} #{/name} 解析循环
 * #:{name.subname} 解析循环内的元素
 * <?!-- --> 注释
 * &{name}
 * ?{name} ?|{name} ?{/name} if ... else ...\n
 * <#include file=""> 导入其他文件
 * {using: filename} 加载模板
 * <using:name>...</using:name> 模板
 * @{name} 外部功能函数
 */
var readFileSync = require("fs").readFileSync;

var SHAPE_INCLUDE = "<#include file=\"",
	INCLUDE_END = " />",
	COMMENT_START = "<?!--",
	COMMENT_END = "--?>";
	END_BRACKES = "}";
var PARA_START = "&{",
	EQUAL_START = "?{",
	EQUAL_END = "?{/",
	ELSE = "?|{",
	AT_START = "@{";
var USING_TAG_START = "<using:",
	USING_TAG_END = "</using:",
	USING_START = "{using:";
var USING_TAG_START_LEN = USING_TAG_START.length,
	USING_TAG_END_LEN = USING_TAG_END.length;
var {errorStatement, noSuchProperty} = Error,
	BLANK = String.BLANK;
var {replaceElement, replaceLoop} = Coralian.ReplaceHolder;
var HTML_FILE_MAP = {};
var pageCache = require("../config/app").getCache('page');

function replaceComment(str) {

	var start = str.indexOf(COMMENT_START);
	var end = str.indexOf(COMMENT_END);

	if(start < 0) {
		if(end > 0) errorStatement();
		return str;
	}

	if(end < start) errorStatement();
	return replaceComment(str.slice(0, start) + str.slice(end + 4));
}

function replaceSpaceLine(str) {

	var pre = [];
	while((matches = str.match(/<pre((.|\s)*?)<\/pre>/)) !== null) {
		var inner = matches[0];
		str = str.replace(inner, "[pre-" + pre.length + "]");
		pre.push(inner);
	}

	var output = [];
	var lines = str.split("\n");

	lines.forEach(function(line) {
		if(!line.trim().isEmpty()) {
			output.push(line);
		}
	});

	str = output.join(BLANK);

	Object.forEach(pre, function(i, e) {
		str = str.replace("[pre-" + i + "]", e);
	});

	return str;
}

function replaceEqual(str, obj, equalStart, equalEnd, equalElse) {

	equalStart = equalStart || EQUAL_START;
	equalEnd = equalEnd || EQUAL_END;
	equalElse = equalElse || ELSE;
	var tagStart = str.indexOf(equalStart);

	if(tagStart < 0) {
		return str;
	}

	var statement = str.slice(tagStart + equalStart.length, tagStart + str.slice(tagStart).indexOf(END_BRACKES));
	var result = false, tmpObj;

	// 多层级对应处理
	if(statement.contains('.')) {
		var tmpStmt = statement.split('.');
		tmpObj = obj;

		for(var i = 0, len = tmpStmt.length; i < len; i++) {
			tmpObj = tmpObj[tmpStmt[i]];
			if(tmpObj === undefined) noSuchProperty(tmpStmt[i]);
		}
	} else {
		tmpObj = obj[statement];
	}

	// 当 statement 的类型不是 function 的时候，当作这个 statement 不存在处理
	if('function' === typeof tmpObj) {
		try {
			result = tmpObj();
		} catch(e) {
			Coralian.logger.err(e.message);
			Coralian.logger.err(e.stack);
			// 当指定 statement 所对应的那个函数在执行过程中抛出错误的时候，当作这个 statement 不存在处理
		}
	}

	var startTag = equalStart + statement + END_BRACKES,
		endTag = equalEnd + statement + END_BRACKES,
		elseTag = equalElse +
		statement + END_BRACKES;
	var start = str.indexOf(startTag),
		end = str.indexOf(endTag),
		out = str.slice(0, start);

	if(result) {
		if(str.contains(elseTag) && end > str.indexOf(elseTag)) {
			out += str.slice(start + startTag.length, str.indexOf(elseTag));
		} else {
			out += str.slice(start + startTag.length, end);
		}
	} else {
		if(str.contains(elseTag) && end > str.indexOf(elseTag)) {
			out += str.slice(str.indexOf(elseTag) + elseTag.length, end);
		}
	}
	out += str.slice(end + endTag.length);

	return replaceEqual(out, obj);
}

/*
 * 加载所有页面
 */
function parseInclude(path) {

	var html = getHTMLFile(path),
		result = [],
		i = 0;

	result.push(html[i++]);
	for(var len = html.length; i < len; i++) {
		var part = html[i];
		var end = part.indexOf(INCLUDE_END);
		var paras = {};
		var using = getUsing(part.slice(0, end), paras);
		var innerHTML = parseInclude(pathResolve(using));
		result.push(replaceElement(innerHTML, paras, PARA_START)); // 页面参数在页面加载时就处理掉
		result.push(part.slice(end + 3));
	}

	return result.join('');
}

function getUsing(using, paras) {

	var arr = using.split('" ');

	for(var i = 1, len = arr.length; i < len; i++) {
		var line = arr[i].split('="');
		paras[line[0]] = line[1].replace('"', String.BLANK);
	}

	// 获得文件
	var file = arr[0];
	if(file.endsWith('"')) {
		file = file.slice(0, file.length - 1);
	}

	return file;

}

function loopMore(str, obj, action) {

	return replaceEqual(str, obj, "#?:{" + action, "#?:{/" + action, "#?|:{/" + action);
}

function replaceAt(str, obj) {

	var tagStart = str.indexOf(AT_START);
	var tagEnd = tagStart + str.slice(tagStart).indexOf(END_BRACKES);

	if(tagStart < 0) return str;

	var statement = str.slice(tagStart + 2, tagEnd);
	var result = String.BLANK;
	if(statement.contains(':')) {
		statement = statement.split(':');
		result = obj[statement[0]].apply(null, statement[1].split(','));
	} else {
		var method = obj[statement];
		if (method) {
			result = obj[statement]();
		}
		
	}
	str = str.slice(0, tagStart) + result + str.slice(tagEnd + 1);

	return replaceAt(str, obj);
}

function getHTMLFile(path) {

	var html = HTML_FILE_MAP[path];

	if(pageCache) {
		if(html === undefined) {
			try {
				html = HTML_FILE_MAP[path] = readFileSync(path, "utf-8").split(SHAPE_INCLUDE);
			} catch(e) {
				Coralian.logger.err("errpath:" + path);
				throw e;
			}
		}
	} else {
		try {
			html = readFileSync(path, "utf-8").split(SHAPE_INCLUDE);
		} catch(e) {
			Coralian.logger.err("errpath:" + path);
			throw e;
		}
	}

	return html;
}

function parseUsing(str, obj) {

	var start = str.indexOf(USING_TAG_START);
	if(start < 0) return str;
	var end = str.slice(start).indexOf(">") + start;
	if(end < 0) return str;
	var usingName = str.slice(start + USING_TAG_START_LEN, end);
	var endTag = USING_TAG_END + usingName + ">";
	var usingEnd = str.indexOf(endTag);
	var usingHtml = str.slice(end + 1, usingEnd);

	obj[usingName] = usingHtml;

	return str.slice(0, start) + parseUsing(str.slice(usingEnd + endTag.length).trim(), obj);
}

function replaceUsing(str) {

	var obj = {};

	str = parseUsing(str, obj);

	// 循环替换，以保证内嵌的 using 也被替换掉
	while(str.contains(USING_START)) {
		str = replaceElement(str, obj, USING_START);
	}

	return str;
}

function parseView(path, obj) {

	// 这里需要把所有页面都 加载完毕之后再去对页面内容进行解析
	var str = parseInclude(path);

	// 去注释
	str = replaceComment(str);
	// 表达式（逻辑）判断
	str = replaceEqual(str, obj);
	// 单元素判断
	str = replaceElement(str, obj);
	// 循环判断
	str = replaceLoop(str, obj, loopMore);
	str = replaceAt(str, obj);
	// 替换 using
	str = replaceUsing(str);
	// 去空行
	str = replaceSpaceLine(str);
	return str;
}

module.exports = parseView;
