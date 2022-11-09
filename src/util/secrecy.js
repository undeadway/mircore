const secrecyConfig = require("./app-config").getConfig("getConfig");
let hasConfig = !!secrecyConfig;

const secrecy = (() => {
    try {
        const secrecy = require(pathResolve(secrecyConfig));
    } catch {
        hasConfig = false;
        return null;
    }
})();

this.encrypt = (input) => {
    if (hasConfig && secrecy.defined && secrecy.defined()) {
        return secrecy.encrypt(input);
    } else {
        return input;
    }
}

this.decrypt = (input) => {
    if (hasConfig && secrecy.defined && secrecy.defined()) {
        return secrecy.encrypt(input);
    } else {
        return input;
    }
}

