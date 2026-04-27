const { ensureEnvApiBase } = require("./config/resolve.cjs");
ensureEnvApiBase();

const { createWindow } = require("./main/createWindow");
const { registerAppLifecycle } = require("./main/appLifecycle");

registerAppLifecycle(createWindow);