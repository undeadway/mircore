
function file () {

	const files = {};

	return {
		saveTo: () => {

		},
		put: (name, _file) => {
			files[name] = _file;
		},
		get: (name) => {
			return files[name];
		}
	};
}

module.exports = {
	query: (data, disposition, type) => {

	}
};

// module.exports = () =>{

// 	let size = 0;
// 	const chunks = [];

// 	return {
// 		push: (chunk) => {
// 			let arr = chunk.split("\r\n");
			
// 			arr.map(item => {
// 				if (String.contains(item, "---")) return;
// 				if (String.contains(item, "Content-")) return;
// 				if (String.isEmpty(item)) return;
// 				chunks.push(item);
// 				size += item.length;
// 			});
// 		},
// 		get: (parse) => {
// 			// let buffer = Buffer.concat(chunks , size);
	
// 			let _f = file();
// 			return _f;
// 		}
// 	};
// };