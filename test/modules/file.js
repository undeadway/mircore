const file = require("../../src/components/public/file");
const input_doc = pathResolve("/demo/res/file/test.doc");
const input_wps = pathResolve("/demo/res/file/test.wps");

const input_et = pathResolve("/demo/res/file/test.et");
const input_xls = pathResolve("/demo/res/file/test.xls");
const input_xlsx = pathResolve("/demo/res/file/test.xlsx");
const input_xlsx1 = pathResolve("/demo/res/file/test1.xlsx");

const input_url = "https://gitee.com/static/images/logo-black.svg";

module.exports = {
    skip: false,
    execute: () => {
        file.createFromLocal(input_wps);
        file.createFromLocal(input_doc);

        file.createFromLocal(input_et);
        file.createFromLocal(input_xls);
        file.createFromPath(input_xlsx);
        file.createFromPath(input_xlsx1);
        file.createFromPath(input_url);
    }
}
