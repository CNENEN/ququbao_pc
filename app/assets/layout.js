const gui = require('nw.gui');
const win = gui.Window.get();
const pkg = require("./package.json");
const AppSettings = pkg.appSettings;
const AppUtils = require("./assets/scripts/AppUtils.js");
const ApiClient = require("./assets/scripts/APIClient.js");
AppUtils.window = window;
ApiClient.window = window;

const _LoginedUserCookieName = "LoginAccount";
const _ApiUrlCookieName = "ApiUrl";
const _Loading = new Loading();

const _LoginedUser = (function () {
    var user = null;

    try {
        user = JSON.parse($.cookie(_LoginedUserCookieName));
        ApiClient.SetToken(user.Token, user.UserId);
    } catch (e) {
    }

    if (user) {
        var name = user.ShopName;
        if (name) name = "@" + name;
        name = user.UserName + (name || "");
        $(".uname").text(name);
    }

    return user;
})();

const _ApiUrl = (function () {
    var api = null;

    try {
        var value = $.cookie(_ApiUrlCookieName);
        if (value) api = JSON.parse(value);
    } catch (e) {
    }

    if (!api) {
        for (var i = 0; i < AppSettings.apiUrls.length; i++) {
            if (AppSettings.apiUrls[i]["selected"] == true) {
                api = AppSettings.apiUrls[i];
                break;
            }
        }
    }

    $('.testname').text(api.key == "production" ? '' : '[' + api.key + ']');

    return api;
})();

const uuid = (function () {
    var cookiename = "UUID";
    var uuid = $.cookie(cookiename);
    if (!uuid) {
        uuid = general();
        $.cookie(cookiename, uuid, { path: "/", expires: 365 });
    }

    function general(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''), uuid = [], i;
        radix = radix || chars.length;

        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
        } else {
            // rfc4122, version 4 form
            var r;

            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';

            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random() * 16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }

        return uuid.join('');
    }

    return uuid;
})();

AppUtils.Dialog.ShowLoading = _Loading.Show;
AppUtils.Dialog.HideLoading = _Loading.Hide;
ApiClient.SetMask(AppUtils.Dialog.ShowLoading, AppUtils.Dialog.HideLoading);
ApiClient.SetServerHost(_ApiUrl.url).SetRequest('post', 'jsonp');

// ===================== Token登录↓ ===================
const loginByToken = function (callback) {
    if (!(_LoginedUser && _LoginedUser.Token)) {
        typeof callback === "function" && callback({ status: -1, msg: "" });
        return;
    }

    ApiClient.Request({
        controller: "User",
        action: "LoginByToken",
        data: {},
        loading: false,
        success: function (e) {
            typeof callback === "function" && callback(e);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            AppUtils.Dialog.Error("服务器繁忙，请稍候重试", function () {
                typeof callback === "function" && callback({ status: -1, msg: "服务器繁忙，请稍候重试。" });
            });
        },
        complete: function (XMLHttpRequest, textStatus) {
        }
    });
};

// 心跳，10秒检测一次
const heartbeat = function () {
    loginByToken(function (e) {
        setTimeout(function () {
            heartbeat();
        }, 10000);
    });
};

// 跳转登录页
const gotoLogin = function (e) {
    $.cookie(_LoginedUserCookieName, '', { path: '/', expires: -1 });
    gui.Window.open("views/login.html?msg=" + encodeURIComponent(e.msg), {
        "width": 280,
        "height": 400,
        "resizable": false,
        "show": true,
        "frame": false,
        "focus": true
    });
    win.close(true);
};

// 跳转主页
const gotoMain = function () {
    gui.Window.open("views/index.html", {
        "min_width": 960,
        "min_height": 600,
        "width": 960,
        "height": 600,
        "show": true,
        "frame": false,
        "focus": true
    });
    win.close(true);
};

// 清除缓存
const clearCookies = function () {
    $.cookie(_LoginedUserCookieName, '', { path: '/', expires: -1 });
    $.cookie(_ApiUrlCookieName, '', { path: '/', expires: -1 });
    $.cookie('UUID', '', { path: '/', expires: -1 });
};

(function (window) {
    // 标题
    win.title = '蛐蛐宝';

    // 重置主窗口
    process.mainModule.exports.setMainWindow(win);

    // 创建托盘
    if (!process.mainModule.exports.backgroundWindow) {
        var backgroundUrl = 'views/tray.html';
        gui.Window.open(backgroundUrl, {
            "show": false
        }, function (backgroudWin) {
            process.mainModule.exports.backgroundWindow = backgroudWin;
        });
    }

    // 清除托盘消息事件
    win.on("focus", function () {
        if (process.mainModule.exports.Qu.tray)
            process.mainModule.exports.Qu.tray.clearNew();
    });

    // 最大化/还原事件
    var isMaximize = false;
    win.on("maximize", function () {
        isMaximize = true;
    });
    win.on("restore", function () {
        isMaximize = false;
    });

    // 最大化/还原
    $("#titlebar_max").off("click").on("click", function () {
        if (isMaximize) {
            win.restore();
        } else {
            win.maximize();
        }
    });

    // 最小化
    $("#titlebar_min").off("click").on("click", function () {
        win.minimize();
    });

    // 关闭
    $("#titlebar_close").off("click").on("click", function () {
        win.close();
    });

    // 禁用右键
    document.body.oncontextmenu = function () { return false; };
    // 禁止接收拖放文件
    window.ondragover = function (e) { e.preventDefault(); return false };
    window.ondrop = function (e) { e.preventDefault(); return false };
    // 禁止图片拖动
    for (i in document.images) document.images[i].ondragstart = function () { return false; };

})(window);