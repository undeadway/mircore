const controller = require("./../../../../src/core/controller");
const { baseAction } = require("./../../../../src/core/actions");

function indexAction() {
    const action = baseAction();

    action.execute = ctrler => {

    };

    return action;
}

function indexController() {

    const ctrler = controller();

    ctrler.addAction(Coralian.constants.HttpRequestMethod.GET, indexAction());

    return ctrler;
}

module.exports = exports = indexController;