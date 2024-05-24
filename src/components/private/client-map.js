function newInstance(req) {

	const clientObj = {};
	const client = {
		put: (k, v) => {
			clientObj[k.toUpperCase()] = v;
		},
		get: (k) => {
			return clientObj[k.toUpperCase()];
		}
	};

	req.client = client;
	return client;
}

module.exports = {
	newInstance
}