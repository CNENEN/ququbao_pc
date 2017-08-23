import cookie from 'js-cookie'
import uuidUtils from 'uuid'
import pkg from '../../../package.json'
import utils from './AppUtils.js'
import client from './APIClient.js'

const _LoginedUserCookieName = 'LoginAccount';
const _ApiUrlCookieName = 'ApiUrl';
const _UUIDCookieName = 'UUID';

export const PackageConfig = pkg;
export const AppSettings = pkg.appSettings;
export const AppUtils = utils;
export const ApiClient = client;

// 登录用户
function GetLoginedUser() {
    var user = null;

    try {
        var cv = cookie(_LoginedUserCookieName);
        if (cv) {
            user = JSON.parse(cv);
            client.SetToken(user.Token, user.UserId);
        }
    } catch (e) {
        console.log(e);
    }

    if (user) {
        var name = user.ShopName;
        if (name) name = '@' + name;
        name = user.UserName + (name || '');
        $('.uname').text(name);
    }

    return user;
}
export let LoginedUser = GetLoginedUser();
export const SaveLoginedUserCookie = function (user) {
    var cookieOpts = { "path": "/" };
    if (user) {
        if (user.IsRememberPwd) cookieOpts.expires = 7;
        cookie(_LoginedUserCookieName, JSON.stringify(user), cookieOpts);
    }
    else {
        cookie(_LoginedUserCookieName, '', { path: '/', expires: -1 });
    }
};

// API配置
export const ApiUrl = (function () {
    var api = null;

    try {
        var cv = cookie(_ApiUrlCookieName);
        cv && (api = JSON.parse(cv));
    } catch (e) {
    }

    if (!api) {
        for (var i = 0; i < pkg.appSettings.apiUrls.length; i++) {
            if (pkg.appSettings.apiUrls[i]['selected'] === true) {
                api = pkg.appSettings.apiUrls[i];
                break;
            }
        }
    }

    var tips = api ? (api.key === 'production' ? '' : '[' + api.key + ']') : '[未配置]';
    $('.testname').text(tips);

    api && client.SetServerHost(api.url); // .SetRequest('post', 'jsonp');

    return api;
})();

export const SaveApiUrlCookie = function (api) {
    cookie(_ApiUrlCookieName, JSON.stringify(api), { "path": "/", expires: 7 });
}

// 设备唯一标识
export const _uuid = (function () {
    var uuid = cookie(_UUIDCookieName);
    if (!uuid) {
        uuid = uuidUtils.v1();
        cookie(_UUIDCookieName, uuid, { path: '/', expires: 365 });
    }

    return uuid;
})();

// Token登录
export const LoginByToken = function (callback) {
    if (!(LoginedUser && LoginedUser.Token))
        LoginedUser = GetLoginedUser();

    if (!(LoginedUser && LoginedUser.Token)) {
        SaveLoginedUserCookie(null);
        NWUtils.gotoLogin({ status: -1, msg: '' });
        return;
    }

    client.Request({
        controller: 'User',
        action: 'LoginByToken',
        data: {},
        loading: false,
        success: function (e) {
            typeof callback === 'function' && callback(e);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            utils.Dialog.Error('服务器繁忙，请稍候重试', function () {
                typeof callback === 'function' && callback({ status: -1, msg: '服务器繁忙，请稍候重试。' });
            });
        },
        complete: function (XMLHttpRequest, textStatus) {
        }
    });
}

// 心跳，10秒检测一次
export const Heartbeat = function () {
    LoginByToken(function (e) {
        setTimeout(function () {
            Heartbeat();
        }, 10000);
    });
}

// 清除缓存
export const ClearCookies = function () {
    cookie(_LoginedUserCookieName, '', { path: '/', expires: -1 });
    cookie(_ApiUrlCookieName, '', { path: '/', expires: -1 });
    cookie(_UUIDCookieName, '', { path: '/', expires: -1 });
}

// 定义全局参数，方便调试使用
window.PackageConfig = pkg;
window.AppSettings = AppSettings;
window.AppUtils = AppUtils;
window.LoginedUser = LoginedUser;
