const secrecyConfig = require("../../util/app-config").getConfig("secrecy");
const { mode: { encrypt } } = require("../../util/app-config");
let hasConfig = !!secrecyConfig;

const secrecy = (() => {
    try {
        const secrecy = require(pathResolve(secrecyConfig));
        return secrecy;
    } catch {
        hasConfig = false;
        return null;
    }
})();

this.encrypt = (input) => {

    if (encrypt && hasConfig && secrecy.defined && secrecy.defined()) {
        return secrecy.encrypt(input);
    } else {
        return input;
    }
}

this.decrypt = (input) => {

    if (encrypt && hasConfig && secrecy.defined && secrecy.defined()) {
        return secrecy.decrypt(input);
    } else {
        return input;
    }
}

