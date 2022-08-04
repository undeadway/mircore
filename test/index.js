const path = "./test/modules/";
const modules = require("fs").readdirSync(path);

require("./../src/index");

modules.map(file => {
    let obj = require("./modules/" + file);
    if (!obj.skip) {
        obj.execute();
    }
});