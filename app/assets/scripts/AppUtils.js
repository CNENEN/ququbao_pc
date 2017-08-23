import Loading from './Loading.js'

var _loading = new Loading();

function spliceTokenQuery(AppUtils, url) {
    var args = ["token", "shopId", "sid", "shopSid", "userId", "terminal"];

    var query = {};
    for (var i = 0; i < args.length; i++) {
        var vallue = AppUtils.Request(args[i]);
        vallue != null && (query[args[i]] = vallue);
    }

    return spliceQueryStrings(url, query, false);
}

// 自动拼接URL上参数
function spliceQueryStrings(url, query, cover) {
    if (!url) return url;

    query = (typeof query === "object") ? query : {};
    cover = (typeof cover === "boolean") ? cover : false;

    var params = {};

    var arr = url.split('?');
    if (arr.length > 1) {
        url = arr[0];

        var strs = arr[1].split("&");
        var ps;
        for (var i = 0; i < strs.length; i++) {
            ps = strs[i].split("=");
            params[ps[0]] = unescape(ps[1]);
        }
    }

    for (var o in query) {
        if (typeof params[o] === "undefined" || cover)
            params[o] = query[o];
    }

    var args = "";
    for (var p in params) {
        args += "&" + p + "=" + encodeURIComponent(params[p]);
    }

    return url + "?" + args.substr(1);
}

export default {

    Dialog: {

        /**
         * 强提示消息
         */
        Alert: function (message, callback) {
            if (typeof window.AppEvent_Alert === "function")
                window.AppEvent_Alert(null, message, callback);
            else {
                alert(message);
                typeof callback === "function" && callback();
            }
        },

        /**
         * 错误提示消息
         */
        Error: function (message, callback) {
            if (typeof window.AppEvent_Alert === "function")
                window.AppEvent_Alert(null, message, callback);
            else {
                alert(message);
                typeof callback === "function" && callback();
            }
        },

        /**
         * 弱提示消息
         */
        Tips: function (message) {
            if (typeof window.AppEvent_HintText === "function")
                window.AppEvent_HintText(message);
            else if (typeof window.alertTips === "function")
                window.alertTips(message);
            else
                alert(message);
        },

        /**
         * 确定/取消提示
         */
        OKCancel: function (message, callback) {
            if (typeof window.AppEvent_OKCancel === "function")
                window.AppEvent_OKCancel("", message, function (index) {
                    if (index > 0)
                        return;
                    typeof callback === "function" && callback(index);
                });
            else {
                var ret = confirm(message);
                if (ret) typeof callback === "function" && callback(0);
            }
        },

        /**
         * 是/否提示
         */
        YesNo: function (message, callback) {
            if (typeof window.AppEvent_YesNo === "function")
                window.AppEvent_YesNo("", message, function (index) {
                    if (index > 0)
                        return;
                    typeof callback === "function" && callback(index);
                });
            else {
                var ret = confirm(message);
                if (ret) typeof callback === "function" && callback(0);
            }
        },

        /**
         * 自定义提示消息
         */
        Show: function (title, text, callback, btnText, timeout, icon) {
            if (typeof window.AppEvent_Alert === "function")
                window.AppEvent_Alert(title, text, callback, btnText, timeout, icon);
            else {
                alert(text);
                typeof callback === "function" && callback();
            }
        },

        /**
         * 显示遮罩层
         */
        ShowLoading: function () {
            _loading.Show();
        },

        /**
         * 隐藏遮罩层
         */
        HideLoading: function () {
            _loading.Hide();
        }
    },

    /**
     * 获取函数的参数列表
     *  @param fn Function 要获取参数列表的函数
     */
    GetArgumentNamesOfFunction: function (fn) {
        if (typeof fn !== 'function')
            return [];

        var regEx = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var code = fn.toString().replace(regEx, '');

        var result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);

        return result === null ? [] : result;
    },

    /**
     * 自动拼接URL参数
     *  @param String url 要拼接的URL，可包含查询参数
     *  @param Object query 要拼接的参数对象
     *  @param Boolean cover 要拼接的参数是否覆盖URL中原有的查询参数
     */
    SpliceQueryStrings: function (url, query, cover) {
        return spliceQueryStrings(url, query, cover);
    },

    /**
     * 获取当前页面中所有查询参数
     */
    GetRequestParameters: function () {
        var parameters = {};

        var rs = decodeURI(window.location.search).substr(1);
        if (!rs) return parameters;

        var strs = rs.split("&");
        var ps;
        for (var i = 0; i < strs.length; i++) {
            ps = strs[i].split("=");
            parameters[ps[0]] = unescape(ps[1]);
        }

        return parameters;
    },

    /**
     * 获取当前页面中指定查询参数值
     */
    Request: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var rs = decodeURI(window.location.search).substr(1).match(reg);
        if (rs != null)
            return unescape(rs[2]);

        return null;
    },

    /**
     * 页面跳转
     */
    NavigateTo: function (url) {
        window.location = spliceTokenQuery(this, url);
    },

    /**
     * 页面跳转（替换当前历史记录点）
     */
    HistoryReplaceState: function (url) {
        history.replaceState(null, null, spliceTokenQuery(this, url));
        window.location.reload();
    },

    /**
     * 清除字符串左边空格，包含换行符
     */
    TrimLeft: function (value) {
        return value.replace(/(^[\s\n]*)/g, "");
    },

    /**
     * 清除字符串右边空格，包含换行符
     */
    TrimRight: function (value) {
        return value.replace(/([\s\n]*$)/g, "");
    },

    /**
     * 清除字符串左右两边空格，包含换行符
     */
    Trim: function (value) {
        return this.TrimRight(this.TrimLeft(value));
    },

    /**
     * 转换数字金额
     *  @param source string/number 源金额
     *  @param precision number 转换后的精度，默认为0（如果需保留两位小数位，可为"2"）
     *  @param multiple number 转换金额相对于源金额的倍数，默认为1（如果是"元"转"分",可为"100";如果是"分"转"元",可为"0.01")
     */
    ConvertDecimal: function (source, precision, multiple) {
        if (typeof source === "string")
            source = parseFloat(source);

        if (typeof source != "number" || isNaN(source))
            source = 0;

        multiple = typeof multiple === "number" ? multiple : 1;
        precision = typeof precision === "number" ? precision : 0;

        return (source * multiple).toFixed(precision);
    }
};