const Strings = {
	CONTENT_TYPE: "Content-Type",
	BINARY: "binary",
	CONTENT_DISPOSITION: "Content-Disposition",
	INDEX: "index"
}

const Names = {
	CONTROLLER: "Controller",
	ACTION: "Action",
	FILTER: "Filter",
	INSPECTOR: "Inspector"
}

const AjaxRenderType = {
	JSON: "JSON"
}

function get(obj, key) {
	return obj[key];
}

const constants = {
	AjaxRenderType: new Proxy(AjaxRenderType, { get }),
	Strings: new Proxy(Strings, { get }),
	Names: new Proxy(Names, { get }),
};

module.exports = exports = new Proxy(constants, { get });