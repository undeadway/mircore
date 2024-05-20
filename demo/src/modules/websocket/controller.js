const controller = mircore.controller.websocket;

const downloadAction = require("./download_action");

function websocketContrlller () {

    const ctrler = controller();

    ctrler.addAction({ action: downloadAction });

    return ctrler;

}

exports = module.exports = websocketContrlller;