const secrecyConfig = require("../../util/app-config").getConfig("secrecy");
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
    if (hasConfig && secrecy.defined && secrecy.defined()) {
        return secrecy.encrypt(input);
    } else {
        return input;
    }
}

this.decrypt = (input) => {
    if (hasConfig && secrecy.defined && secrecy.defined()) {
        return secrecy.decrypt(input);
    } else {
        return input;
    }
}

