# Chinese

## 概要
这是一个基于 Noodejs 的玩具服务器。  
这个服务器只用于个人学习使用。  
demo 文件夹下是服务器的一个简单案例。

## 实现功能
* 可以进行路由控制；
* 拒绝指定客户端访问；
* 文件上传；

## 启动
```
var server = require("mircore");
server.start();
```

## 实际应用
* [路上的垃圾回收](http://waygc.net)
* [道亦会](http://daoyiclub.com)

## TODO
* 断点续传
* 更高级的 http 处理；

## 教程
[教程](./documents/cn/manual.md)

## License
Apache 2.0

# English
This is a toy server built by node.js.  
This package is for study.  
The demo folder holds a simple instance of mircore.

## Supported
* Router control;
* To reject the request of specified clinets;
* File uploads/downloads;

## Start
```
var server = require("mircore");
server.start();
```

## Instance
* [路上的垃圾回收](http://waygc.net)
* [道亦会](http://daoyiclub.com)

## TODO
* resume from break point
* more http supports;

## License
Apache 2.0

## Manual
[Manual](./documents/en/manual.md)