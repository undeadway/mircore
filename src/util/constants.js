let that = module.exports = exports = {};

Object.defineProperty(that, 'AjaxRenderType', {
	value : {
		//File : 'File',
		JSON : 'JSON'
	},
	writeable : false
});

Object.defineProperty(that, 'MimeType', {
	value : {
		// application
		JSON : 'application/json',
		PDF : 'application/pdf',
		JAVASCRIPT : 'application/javascript',
		OCTET_STREAM : 'application/octet-stream',
		DTD : 'application/xml-dtd',
		ZIP : 'application/zip',
		// text
		TEXT : 'text/plain',
		HTML : 'text/html',
		XML : 'text/xml',
		CSS : 'text/css',
		CSV : 'text/csv',
		// image
		GIF : 'image/gif', 
		PNG : 'image/png',
		JPG : 'image/jpeg', 
		BMP : 'image/bmp',
		WEBP : 'image/webp',
		ICON : 'image/x-icon',
		SVG : 'image/svg+xml'
	},
	writeable : false
});


