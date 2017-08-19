var $ = require('./jquery-1.11.2.min.js');
var AppUtils = require("./AppUtils.js");

/*
 * 公共接口调用方法，基于jQuery.js
 *  调用步骤：
 *      1.[必填]设置服务器Host
 *          ApiClient.SetServerHost("http://localhost:15049/api");
 *      2.[可选]设置请求Token
 *          ApiClient.SetToken("43ac9fbe2cb22679064b2003291334c8");
 *      3.[可选]设置请求方法类型，默认请求方法为 get/jsonp
 *          ApiClient.SetRequest("post","json"); 
 *      4.[可选]设置请求遮罩层显示/隐藏
 *          ApiClient.SetMask(mDialog.ShowLoading,mDialog.HideLoading);
 *      5.[可选]设置弹窗提示事件
 *          ApiClient.SetDialog(alert,alert,alert)
 *      6.[必填]发送请求【推荐方法二】
 *          方法一、【不推荐】传递全参数，必须按照以下参数顺序【controller, action, data, success, error, complete, async, encrypt】调用
 *              ApiClient.Request("values","get",{
 *                  data: "eOZ9/jfFv438DJCLpSdJeTAv9KgAGK5xF5Cfkq0vGKXSdH2XQch/wI5kBh0r28J0DJJPTRHfhqSg/x8kewmhaQ=="
 *              },function(){ // 成功事件
 *              },function(){ // 失败事件
 *              },function(){ // 完成事件
 *              },true);
 *          方法二、【推荐】传递一个对象
 *              ApiClient.Request({
 *                  controller: "test", // 控制器名称
 *                  action: "get",  // Action名称
 *                  encrypt: false, // 是否请求加密，默认为false，选填
 *                  async: true,    // 是否异步请求，默认为true，选填
 *                  data: {
 *                      userId: "10086"
 *                  },
 *                  success: function(e){ },    // 请求成功事件，选填
 *                  error: function(XMLHttpRequest, textStatus, errorThrown){ },    // 请求失败事件，选填
 *                  complete: function(XMLHttpRequest, textStatus){ },  // 请求完成事件（成功、失败都会调用），选填
 *              });
 */

var _host = null; // 服务端Host
var _requestMethod = "get"; // 请求类型：get/post
var _requestDataType = "jsonp"; // 预期服务器返回的数据类型
var _token = null; // 请求Token
var _userId = null; // 用户编号

// 遮罩层对象
var _mask = {
    show: function () { },
    hide: function () { }
};

// 提示弹窗
var _dialog = {
    alert: function (message) { alert(message); }, // 强提示信息
    error: function (message) { alert(message); }, // 错误输出信息
    tips: function (message) { alert(message); } // 弱提示信息
};

var _client = {

    /**
     * 获取设置的服务端Host
     */
    GetServerHost: function () {
        return _host;
    },

    /**
     * 初始化服务端Host
     *  @param host String 请求服务端地址（http://{ip}:{port}/）
     */
    SetServerHost: function (host) {
        if (!host) {
            log("server host is null or empty.");
            return this;
        }

        if (host.substring(host.length - 1) != "/")
            host += "/";

        _host = host;

        return this;
    },

    /**
     * 设置请求类型
     *  @param methodType String 请求类型：get/post
     *  @param dataType String 预期服务器返回的数据类型
     */
    SetRequest: function (methodType, dataType) {
        if (methodType != "get" && methodType != "post") {
            log("request method is not supported.");
            return this;
        }

        if (dataType != "json" && dataType != "jsonp") {
            log("datatype is not supported.")
            return this;
        }

        _requestMethod = methodType;
        _requestDataType = dataType;

        return this;
    },

    /**
     * 设置请求所需Token
     *  @param token String 请求Token
     *  @param userId String 用户编号
     */
    SetToken: function (token, userId) {
        if (!token) {
            log("token is null or empty.");
            return this;
        }

        if (!userId) {
            log("userId is null or empty.");
            return this;
        }

        _token = token;
        _userId = userId;

        return this;
    },

    /**
     * 设置请求遮罩层显示/隐藏
     *  @param show Function 显示遮罩层方法
     *  @param hide Function 隐藏遮罩层方法
     */
    SetMask: function (show, hide) {
        if (!(typeof show === "function" && typeof hide === "function")) {
            log("mask event must be a function.");
            return this;
        }

        _mask = { show: show, hide: hide }

        return this;
    },

    /**
     * 设置弹窗提示事件
     *  @param _alert Function 强提示方法
     *  @param _error Function 错误提示方法
     *  @param _tips Function 弱提示方法
     */
    SetDialog: function (_alert, _error, _tips) {
        if (typeof _alert != "function") {
            log("dialog event must be a function.");
            return this;
        }

        _dialog = {
            alert: _alert,
            error: (typeof _error === "function") ? _error : _alert,
            tips: (typeof _tips === "function") ? _tips : _alert
        };

        return this;
    },

    /**
     * 发送请求
     *  @param controller string 控制器名称
     *  @param action string Action名称
     *  @param data JSON 请求参数JSON对象
     *  @param success Function 请求成功事件
     *  @param error Function 请求失败事件
     *  @param complete Function 请求完成事件（成功、失败都会调用）
     *  @param async Boolean 是否异步请求，默认为true
     *  @param encrypt Boolean 是否请求加密，默认为false
     *  @param loading Boolean 是否显示Loading遮罩层，默认为true
     */
    Request: function (controller, action, data, success, error, complete, async, encrypt, loading) {
        return request(controller, action, data, success, error, complete, async, encrypt, loading);
    }
};

// 记录日志
function log(message) {
    console.log(message);
}

/**
 * 获取参数信息
 *  @param diffCase bool 是否区分大小写，默认为false
 */
function getArgs(diffCase) {
    diffCase = typeof diffCase === "boolen" ? diffCase : false;

    var caller = arguments.callee.caller;//获取调用函数
    if (caller == null || caller.arguments.length == 0)
        return result;

    // 压缩js后函数参数名称会变化，所以这里写死参数名
    // var argArray = AppUtils.GetArgumentNamesOfFunction(caller);
    var argArray = ["controller", "action", "data", "success", "error", "complete", "async", "encrypt", "loading"];

    var result = {};

    var params = caller.arguments[0];//获取参数对象
    var index = typeof (params) == "object" ? 1 : 0;//是否是对象，是对象返回赋值索引1
    if (index == 1) {
        for (var p in params) {
            for (var i = 0; i < argArray.length; i++) {
                var arg = AppUtils.Trim(argArray[i]);
                if (diffCase) {
                    if (arg == p) {
                        result[arg] = params[p];
                        break;
                    }
                } else {
                    if (arg.toLocaleLowerCase() == p.toLocaleLowerCase()) {
                        result[arg] = params[p];
                        break;
                    }
                }
            }
        }
    }
    else {
        for (var i = index; i < argArray.length && i < caller.arguments.length; i++) {
            result[AppUtils.Trim(argArray[i])] = caller.arguments[i];
        }
    }

    return result;
}

// 获取请求URL
function getUrl(controller, action) {
    if (!(_host && controller && action)) {
        _dialog.error("找不到服务地址");
        return;
    }

    return _host + controller + "/" + action;
}

// 调用APP加密函数对请求进行加密
function encryptRequest(args, callback) {
    if (typeof args.encrypt == "boolean" && args.encrypt)
        args.encrypt = true;
    else
        args.encrypt = false;

    args.token = args.token || _token || null;
    args.data = args.data || { "__timestamp__": new Date().getTime() };

    if (!args.token || !args.encrypt || typeof _client.window.AppEvent_EncryptRequest != "function") {
        callback(args.data);
        return;
    }

    _client.window.AppEvent_EncryptRequest(args.token, _userId, args.data, callback);
}

// 调用APP解密函数对请求响应进行解密
function decryptResponse(args, e, callback) {
    e = checkDuplicateLogin(e);
    if (!e) return;

    if (!args.token || !args.encrypt || typeof _client.window.AppEvent_DecryptResponse != "function") {
        callback(e.data);
        return;
    }

    _client.window.AppEvent_DecryptResponse(args.token, _userId, e.data, callback);
}

// 未登录或用户信息异常结果判定
function checkDuplicateLogin(e) {
    if (!e || typeof e != "object")
        return e;

    // 判断接口返回状态(未登录，或者用户信息异常)
    if (e.status == "002100" || (e.status.length == 6 && e.status.substr(0, 3) == "003")) {
        if (typeof _client.window["AppEvent_AppDuplicateLogin"] === "function") {
            _client.window.AppEvent_AppDuplicateLogin(e.msg);
        } else {
            _client.window.location.href = "views/error.html?status=" + e.status + "&msg=" + encodeURIComponent(e.msg);
        }
        return;
    }

    return e;
}

// 发送请求
function request(controller, action, data, success, error, complete, async, encrypt, loading) {
    var args = getArgs();
    var url = getUrl(args.controller, args.action);
    if (!url) {
        log("请求地址异常");
        return;
    }

    if (typeof args.loading != "boolean") args.loading = true;

    var result = null; // 同步且不需要加密的请求可直接返回结果

    encryptRequest(args, function (data) {
        if (typeof data === "string") data = { data: data };
        if (args.token) data["token"] = args.token;

        $.ajax({
            type: _requestMethod,
            dataType: _requestDataType,
            jsonp: "jsonp",
            async: args.async === false ? false : true,
            url: url,
            data: data,
            beforeSend: function (XMLHttpRequest) {
                args.loading && _mask.show();
            },
            success: function (e) {
                args.loading && _mask.hide();
                decryptResponse(args, e, function (data) {
                    if (typeof data === "string") {
                        try {
                            data = JSON.parse(data);
                        } catch (ex) {
                        }
                    }

                    e.data = data;
                    if (typeof args.success === "function") args.success(e);
                    result = e;
                });
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                args.loading && _mask.hide();
                if (typeof args.error === "function") args.error(XMLHttpRequest, textStatus, errorThrown);
            },
            complete: function (XMLHttpRequest, textStatus) {
                if (typeof args.complete === "function") args.complete(XMLHttpRequest, textStatus);
            }
        });
    });

    return result;
}

_client
    .SetMask(AppUtils.Dialog.ShowLoading, AppUtils.Dialog.HideLoading)
    .SetDialog(AppUtils.Dialog.Alert, AppUtils.Dialog.Error, AppUtils.Dialog.Tips);

module.exports = _client;