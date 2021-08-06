const size = 0;
const chunks = [];

function file () {

	const files = {};

	return {
		saveTo: () => {

		},
		put: (name, buffer) => {

		},
		get: (name) => {
			return files[name];
		}
	};
}

module.exports = {
	push: (chunk) => {
		chunks.push(chunk);
		size += chunk.length;
	},
	get: (parse) => {
		let buffer = Buffer.concat(chunks , size);

		let _f = file();
		return _f;
	}
};