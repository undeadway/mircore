# 1. 关于 mircore


# 2. 项目

## 2.1. 安装
安装完毕 `nodejs` 环境后，在项目根目录中执行
```
npm install
```
即可安装 `mircore` 到本地。

## 2.2. 项目结构
从项目根目录来看，程序的基本结构如下：
```
index.js
package.json
./src/
./res/
    json/
        app.json
```

## 2.2.1. index.js
`index.js` 是程序的入口文件。
在这里只要引入 `mircore`，并启动服务即可。
```
const server = require("mircore");
server.start();
```

## 2.2.2. package.json
nodejs 的程序配置，不多做解释。

## 2.2.3. res 文件夹
这里是所有资源文件的配置。  
程序启动时，这里配置一个 json 文件夹，配置程序所必需的配置项目。  

具体说明参考 **[2.3. 程序配置](#22-程序配置)**

## 2.2.4. src 文件夹
这里是程序的代码文件。

具体说明参考 **[2.4. 第一个程序](#23-第一个程序)**

## 2.3. 程序配置
程序所有的配置都方在 `/res/json/app.json` 这个文件里。 

**这些配置都由 mircore 来实现，不用开发者自己写代码来调用**。

### 2.3.1. 端口号
开发模式的配置名是 `port` ，如果不配置，默认使用 `9000` 。

启动程序后，可以通过 `http://localhost:9000` 来访问网站。

### 2.3.2. 参数分割符
参数分割符的配置名是 `split-mark` ，如果不配置，默认使用`:`。

mircore 支持在 url 中带参数，形式如下： `/controller/action/parameters` 。  
暂时先关注最后的 `parameters` 。这部分可以由多个参数构成，所以需要一个分割符来区分不同的参数：`/controller/action/p1:p2:p3`。
关于 mircore 的 url 说明，可以参考[2.3.2. url](#232-url)

### 2.3.3. 开发模式
开发模式的配置名是 `develop-mode` ，如果不配置，默认使用 `true`（开发模式）。

开发模式可以用于判断当前程序是处于开发状态还是生产状态。

### 2.3.4. 程序名称
程序名称的配置名是 `app-name` 。如果配配置，则不会有程序名。

### 2.3.5. 路由
程序名称的配置名是 `routes` 。

路由的配置是一个 `key-value` 结构。  
`key` 是浏览器中的访问路径，`value` 是程序对应的程序模块（文件夹）。  
`key`、`value` 之间是多对一的关系，也即同一个程序模块可以有多个不同的入口。  
`key` 中只配置 `controller`，而不要把 `action` 也写入配置。  
`key` 作用于浏览器中，所以可以和实际的模块名（value）不一致。

### 2.3.6. 完整的示例
```
{
	"port": 9000,
	"split-mark": ":",
	"develop-mode": true,
	"app-name": "mircore-demo",
	"routes": {
		"/index": "/homepage"
	}
}
```


## 2.4. 第一个程序
所有的程序代码都放在 `src` 文件夹中。

在 `src` 文件夹中新建 `modules` 文件夹存放所有模块的代码文件。  
然后在 `modules` 文件夹中新建一个 `homepage` 文件夹，这个 `homepage` 就代表了一个模块。

在 `app.json` 中的 `routes` 配置中添加一条配置：
```
routes: {
    "/index": "/homepage"
}
```
这样，模块和 浏览器url 之间的对应关系就建立好了。然后在 `homepage` 文件夹中新建一个叫 `controller.js` 的文件。  
**不要随意修改 `controller.js` 的文件名，否则 mircore 将无法识别**。

然后在 `controller.js` 中写下面的代码，一个最简单的网站就建好了，可以通过浏览器访问了。
```
const controller = require("mircore").controller;

function indexController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		ctrler.render("Hello world!");
	});

	return ctrler;
}

module.exports = exports = indexController;
```
>![图1 Hello world](./../imgs/helloworld.png)
>图1 Hello world

### 2.4.1 渲染
在上述示例中，采用了直接将文本渲染到前端页面中的方式。  
在 mircore 中，也可以采用模板化处理来渲染一个 HTML 文件。  
此时，就需要先引入一个 HTML 文件，这个文件的位置从项目根目录开始。
```
const page = '/res/html/homepage.html'
```

再将上面的 controller 代码修改为：
```
const controller = require("mircore").controller;

function indexController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		ctrler.render(page); // 这里表示通过文件渲染
	});

	return ctrler;
}

module.exports = exports = indexController;
```

而对应的 HTML 文件中则是：
```
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<title></title>
</head>
<body>
<p>Hello world!</p>
</body>
</html>
```
就可以获得和 图1 相同的效果。

因为采用了模板，所以也可以将变量放置到页面中去。
```
const controller = require("mircore").controller;

function indexController() {

	const ctrler = controller();

	ctrler.addAction(() => {
        ctrler.setAttr("tpl_val", "Hello world!");
		ctrler.render(page);
	});

	return ctrler;
}

module.exports = exports = indexController;
```
HTML 文件修改为：
```
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<title></title>
</head>
<body>
<p>${tpl_val}</p>
</body>
</html>
```
同样可以获得和 图1 相同的效果。

模板的更多配置可以参考：[](./page-template.md)

## 2.5 url
mircore 把 url 分成了四段。一个完整的 url 应该类似下面的结构：
`/controller/action/parametes?queries`

### 2.5.1. controller
因为模块可以组织成结构，所以 controller 支持多层形式
比如一个模块组织为如下形式：
```
/client/
    /local
	/cloud
```
在这种情况下，client 模块有两种处理逻辑：本地处理和云端处理。  
而这两个模块的逻辑可能会不太一样，所以分成了两个子模块。  

这样做的好处是可以将类似的代码组织在一起，而浏览器访问的时候，通过配置，可以少一层 router：
```
routes: {
    "/local": "/client/local"
    "/cloud": "/client/cloud"
}
```
当然，写成下面这样也完全没有问题。
```
routes: {
    "/client/local": "/client/local"
    "/client/cloud": "/client/cloud"
}
```

上面实现的代码就是一个 controller 。
```
const controller = require("mircore").controller;

function indexController() {

	const ctrler = controller();

	ctrler.addAction(() => {
		ctrler.render("Hello world!");
	});

	return ctrler;
}

module.exports = exports = indexController;
```

所有 controller 类必需通过 xxxController 这个函数来实现，前面的 xxx 可以自定义修改。

#### 2.5.1.1. index
当 controler 为 index 的时候，只有当访问首页，也即 url 中值有域名和 queies 的时候可以省略 index 。
示例：
```
http://127.0.0.1/
http://127.0.0.1/?abc=123
```

### 2.5.2. action
url 的第二段是 action ，对应的是各个模块中所会产生的动作或者要获得的内容形式。
action 对应的是 controller 中的方法。

在上面的代码中，就通过 `ctrler.addAction` 来加载了一个 action。
```
const controller = require("mircore").controller;

function indexController() {

	const ctrler = controller();

	ctrler.addAction(() => {
        ctrler.setAttr("tpl_val", "Hello world!");
		ctrler.render(page);
	});

	return ctrler;
}

module.exports = exports = indexController;
```

action 可以是一个普通的函数，也可以是一个类。  
mircore 提供了两个 action 的基类： baseAction、ajaxAction。

#### 2.5.2.1. baseAction
baseAction 是所有 action 的基类。
引入的方式是
```
const baseAction = require("mircore").baseAction;
```

然后再建立一个属于自己的 action 类。
```
function indexAction() {
	const action = baseAction();
	return action;
}
```
所有 action 类必需通过 xxxAction 这个函数来实现，前面的 xxx 可以自定义修改。

将 action 加载到 controller 中的方式有两种，第一种是不带名称，另一种是带名称。

##### 2.5.2.1.1. 用匿名函数作为 action
代码就如最开始示例的
```
ctrler.addAction(() => {
});
```
通过这种方式加载的 action，所对应的 url 就是 index。

#### 2.5.2.1. ajaxAction

### 2.5.3 paramters

### 2.5.4. queries