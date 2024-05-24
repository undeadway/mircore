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
const { readFileSync } = require("fs");

const pageCache = require("../../util/app-config").getCacheConfig("page");
const { errorStatement, noSuchProperty } = Error;
const { replaceElement, replaceLoop } = Coralian.ReplaceHolder;
const { Char, Encoding: { UTF8 } } = JsConst;

const HTML_FILE_MAP = {};
const SHAPE_INCLUDE = "<#include file=\"",
	INCLUDE_END = " />",
	COMMENT_START = "<?!--",
	COMMENT_END = "--?>";

const PARA_START = "&{",
	EQUAL_START = "?{",
	EQUAL_END = "?{/",
	EQUAL_ELSE = "?|{",
	END_BRACKES = "}",
	AT_START = "@{",
	LOOP_START = "#?:{",
	LOOP_END = "#?:{/",
	LOOP_ELSE = "#?|:{";

const USING_TAG_START = "<using:",
	USING_TAG_END = "</using:",
	USING_START = "{using:";

const USING_TAG_START_LEN = USING_TAG_START.length;

function replaceComment(str) {

	let start = str.indexOf(COMMENT_START);
	let end = str.indexOf(COMMENT_END);

	if (start < 0) {
		if (end > 0) errorStatement();
		return str;
	}

	if (end < start) errorStatement();
	return replaceComment(str.slice(0, start) + str.slice(end + 4));
}

function replaceSpaceLine(str) {

	let pre = [];
	while ((matches = str.match(/<pre((.|\s)*?)<\/pre>/)) !== null) {
		let inner = matches[0];
		str = str.replace(inner, `[pre-${pre.length}]`);
		pre.push(inner);
	}

	let output = [];
	let lines = str.split(Char.Space.LF);

	lines.forEach(function (line) {
		if (!String.isEmpty(String.trim(line))) {
			output.push(line);
		}
	});

	str = output.join(String.BLANK);

	Object.forEach(pre, function (i, e) {
		str = str.replace(`[pre-${i}]`, e);
	});

	return str;
}

function replaceEqual(str, obj, equalStart, equalEnd, equalElse) {

	equalStart = equalStart || EQUAL_START;
	equalEnd = equalEnd || EQUAL_END;
	equalElse = equalElse || EQUAL_ELSE;
	let tagStart = str.indexOf(equalStart);

	if (tagStart < 0) {
		return str;
	}

	let statement = str.slice(tagStart + equalStart.length, tagStart + str.slice(tagStart).indexOf(END_BRACKES));
	let result = false, tmpObj;

	// 多层级对应处理
	if (String.contains(statement, Char.POINT)) {
		let tmpStmt = statement.split(Char.POINT);
		tmpObj = obj;

		for (let i = 0, len = tmpStmt.length; i < len; i++) {
			tmpObj = tmpObj[tmpStmt[i]];
			if (tmpObj === undefined) noSuchProperty(tmpStmt[i]);
		}
	} else {
		tmpObj = obj[statement];
	}

	// 当 statement 的类型不是 function 的时候，当作这个 statement 不存在处理
	if (typeIs(tmpObj, Function.TYPE_NAME)) {
		try {
			result = tmpObj();
		} catch (e) {
			// 当指定 statement 所对应的那个函数在执行过程中抛出错误的时候，当作这个 statement 不存在处理
			Coralian.logger.err(e.message);
			Coralian.logger.err(e.stack);
		}
	}

	let startTag = equalStart + statement + END_BRACKES,
		endTag = equalEnd + statement + END_BRACKES,
		elseTag = equalElse +
			statement + END_BRACKES;
	let start = str.indexOf(startTag),
		end = str.indexOf(endTag),
		out = str.slice(0, start);

	if (result) {
		if (String.contains(str, elseTag) && end > str.indexOf(elseTag)) {
			out += str.slice(start + startTag.length, str.indexOf(elseTag));
		} else {
			out += str.slice(start + startTag.length, end);
		}
	} else {
		if (String.contains(str, elseTag) && end > str.indexOf(elseTag)) {
			out += str.slice(str.indexOf(elseTag) + elseTag.length, end);
		}
	}
	out += str.slice(end + endTag.length);

	return replaceEqual(out, obj, equalStart, equalEnd, equalElse);
}

/*
 * 加载所有页面
 */
function parseInclude(path) {

	let html = getHTMLFile(path),
		result = [],
		i = 0;

	result.push(html[i++]);
	for (let len = html.length; i < len; i++) {
		let part = html[i];
		let end = part.indexOf(INCLUDE_END);
		let paras = {};
		let using = getUsing(part.slice(0, end), paras);
		let innerHTML = parseInclude(pathResolve(using));
		result.push(replaceElement(innerHTML, paras, PARA_START)); // 页面参数在页面加载时就处理掉
		result.push(part.slice(end + 3));
	}

	return result.join(String.BLANK);
}

function getUsing(using, paras) {

	let arr = using.split("\" ");

	for (let i = 1, len = arr.length; i < len; i++) {
		let line = arr[i].split("=\"");
		paras[line[0]] = line[1].replace(Char.DQUOTE, String.BLANK);
	}

	// 获得文件
	let file = arr[0];
	if (file.endsWith(Char.DQUOTE)) {
		file = file.slice(0, file.length - 1);
	}

	return file;
}

function loopMore(str, obj, action) {

	return replaceEqual(str, obj, `${LOOP_START}${action}`, `${LOOP_END}${action}`, `${LOOP_ELSE}${action}`);
}

function replaceAt(str, obj) {

	let tagStart = str.indexOf(AT_START);
	let tagEnd = tagStart + str.slice(tagStart).indexOf(END_BRACKES);

	if (tagStart < 0) return str;

	let statement = str.slice(tagStart + 2, tagEnd);
	let result = String.BLANK;
	if (String.contains(statement, Char.COLON)) {
		statement = statement.split(Char.COLON);
		result = obj[statement[0]].apply(null, statement[1].split(Char.COMMA));
	} else {
		let method = obj[statement];
		if (method) {
			result = obj[statement]();
		}

	}
	str = str.slice(0, tagStart) + result + str.slice(tagEnd + 1);

	return replaceAt(str, obj);
}

function getHTMLFile(path) {

	let html = HTML_FILE_MAP[path];

	if (pageCache) {
		if (html === undefined) {
			try {
				html = HTML_FILE_MAP[path] = readFileSync(path, UTF8).split(SHAPE_INCLUDE);
			} catch (e) {
				Coralian.logger.err("errpath:" + path);
				throw e;
			}
		}
	} else {
		try {
			html = readFileSync(path, UTF8).split(SHAPE_INCLUDE);
		} catch (e) {
			Coralian.logger.err("errpath:" + path);
			throw e;
		}
	}

	return html;
}

function parseUsing(str, obj) {

	let start = str.indexOf(USING_TAG_START);
	if (start < 0) return str;
	let end = str.slice(start).indexOf(Char.Angle.RIGHT) + start;
	if (end < 0) return str;
	let usingName = str.slice(start + USING_TAG_START_LEN, end);
	let endTag = USING_TAG_END + usingName + Char.Angle.RIGHT;
	let usingEnd = str.indexOf(endTag);
	let usingHtml = str.slice(end + 1, usingEnd);

	obj[usingName] = usingHtml;

	return str.slice(0, start) + String.trim(parseUsing(str.slice(usingEnd + endTag.length), obj));
}

function replaceUsing(str) {

	let obj = {};

	str = parseUsing(str, obj);

	// 循环替换，以保证内嵌的 using 也被替换掉
	while (String.contains(str, USING_START)) {
		str = replaceElement(str, obj, USING_START);
	}

	return str;
}

function parseView(path, obj) {

	// 这里需要把所有页面都 加载完毕之后再去对页面内容进行解析
	let str = parseInclude(path);

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
