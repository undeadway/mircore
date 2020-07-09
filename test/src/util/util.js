const links = ['', 'index', 'next', 'first', 'second', 'err'];

this.getLink = () => {
	let index = Math.trunc(Math.random() * links.length);
	return links[index];
};