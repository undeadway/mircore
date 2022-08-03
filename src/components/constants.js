const Strings = {
	CONTENT_TYPE: "Content-Type",
	BINARY: "binary",
	CONTENT_DISPOSITION: "Content-Disposition",
	CONTROLLER: "Controller",
	INDEX: "index",
	ACTION: "Action",
	UTF8: "utf-8",
	BASE64: "base64"
}

const AjaxRenderType = {
	JSON: "JSON"
}

function get(obj, key) {
	return obj[key];
}

const constants = {
	AjaxRenderType: new Proxy(AjaxRenderType, { get }),
	Strings: new Proxy(Strings, { get })
};

module.exports = exports = new Proxy(constants, {
	get: (obj, key) => {
		return obj[key];
	}
});