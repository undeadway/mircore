const STR_CONTENT_TYPE = "Content-Type",
	STR_BINARY = "binary",
	STR_CONTENT_DISPOSITION = "Content-Disposition",
	STR_CTRLER = "Controller",
	STR_INDEX = "index",
	STR_ACTION = "Action";

const constants = {
	AjaxRenderType: {
		JSON: "JSON"
	},
	Strings: {
		CONTENT_TYPE: STR_CONTENT_TYPE,
		BINARY: STR_BINARY,
		CONTENT_DISPOSITION: STR_CONTENT_DISPOSITION,
		CONTROLLER: STR_CTRLER,
		ACTION: STR_ACTION,
		INDEX: STR_INDEX
	}
};

module.exports = exports = new Proxy(constants, {
	get: (obj, key) => {
		return obj[key];
	}
});