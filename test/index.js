const server = require("../src/index");
/**
 * 真实项目中，因为使用 requrire("mircore") 来导入 mircore
 * 所以并不需要再将 mircore 挂载到 global 上的操作
 */
global.mircore = server;
server.start();