let config = JSON.parse(require("fs").readFileSync(pathResolve("/res/json/site.json")));

let that = module.exports = exports = {};
if (config.database) {
    config.database = require(config.database);
}

that.getConfig = (name) => {
    return config[name];
}
