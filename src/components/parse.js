const url = require("url"), qs = require("querystring");

module.exports = () => {

	let chunks = [], size = 0;
	parse = null;

	return {
		init: (req) => {
			parse = req.parse = url.parse(req.url, true);
		},
		push: (chunk) => {
			chunks.push(chunk);
			size += chunk.length;
		},
		end: () => {
			Object.addAll(qs.parse( chunks.join(String.BLANK)), parse.query);
		}
	};
};