const os = require('os');

function bindElementEvent4Login() {
    $("#txtUserName4Pwd").focus();

    $("#txtUserName4Pwd,#txtPassword4Pwd").off("keydown keyup").on("keydown", function (e) {
        if (e.which == 13) { loginByPwd(); }
    }).on("keyup", function () {
        toggleLoginButton("pwd");
    });

    $("#txtUserName4Sms,#txtSmsCode4Sms").off("keydown keyup").on("keydown", function (e) {
        if (e.which == 13) { loginBySms(); }
    }).on("keyup", function () {
        toggleLoginButton("sms");
    });

    $("#btnLoginByPwd").off("click").on("click", loginByPwd);
    $("#btnLoginBySms").off("click").on("click", loginBySms);

    $('[data-toggle-login]').off("click").on("click", function () {
        var type = $(this).attr("data-toggle-login");
        toggleLoginBy(type);
    });

    $('[data-smschannel]').off("click").on("click", function () {
        var channel = $(this).attr("data-smschannel");
        SendSms(channel);
    });
}

function toggleLoginButton(type) {
    if (type == "pwd") {
        if ($("#txtUserName4Pwd").val() && $("#txtPassword4Pwd").val())
            $("#btnLoginByPwd").removeClass("btn1a").addClass("btn1");
        else
            $("#btnLoginByPwd").removeClass("btn1").addClass("btn1a");
    } else {
        if ($("#txtUserName4Sms").val() && $("#txtSmsCode4Sms").val())
            $("#btnLoginBySms").removeClass("btn1a").addClass("btn1");
        else
            $("#btnLoginBySms").removeClass("btn1").addClass("btn1a");
    }
}

function toggleLoginBy(type) {
    if (type == 'pwd') {
        var mobile = $("#txtUserName4Sms").val();
        mobile && $("#txtUserName4Pwd").val(mobile);
        $("#divSms").hide();
        $("#divPwd").show();
    } else {
        var username = $.trim($("#txtUserName4Pwd").val());
        if (username && /^[\d]{11}$/g.test(username))
            $("#txtUserName4Sms").val(username);

        $("#divPwd").hide();
        $("#divSms").show();
    }
}

function getTerminalInfo() {
    return {
        appVersion: pkg.version,
        uuid: uuid,
        terminalManufactor: os.type(),
        terminalModel: os.platform(),
        osInfo: os.arch()
    };
}

// ===================== 密码登录↓ =====================
function getCondition4Pwd() {
    var username = $.trim($("#txtUserName4Pwd").val());
    if (username == "16888888888") {
        window._clickcount = (window._clickcount || 0) + 1;
        if (window._clickcount >= 5) {
            showApiUrls();
        }
        return false;
    }

    if ($("#btnLoginByPwd").hasClass("btn1a")) return;

    if (!username) {
        AppUtils.Dialog.Error("请输入账号/手机号", function () {
            $("#txtUserName4Pwd").focus();
        });
        return false;
    }

    var pwd = $("#txtPassword4Pwd").val();
    if (!pwd) {
        AppUtils.Dialog.Error("请输入密码", function () {
            $("#txtPassword4Pwd").focus();
        });
        return false;
    }

    return {
        loginName: username,
        password: hex_md5(pwd),
        terminal: AppSettings.terminal,
        IsRememberPwd = $("#divPwd").css("display") != "none" && $("#chkRememberPwd").is(":checked"),
        sign: "sign"
    };
}

function loginByPwd() {
    var data = getCondition4Pwd();
    if (!data) return;

    data = $.extend({}, getTerminalInfo(), data);

    //login
    onLogined(data);
}

// ==================== 验证码登录↓ =====================
var smsSN = (function () {
    var sn = '';
    for (var i = 0; i < 6; i++) {
        sn += Math.floor(Math.random() * 10);
    }
    return sn;
})();

function getMobile4Sms() {
    var mobile = $.trim($("#txtUserName4Sms").val());
    if (!mobile) {
        AppUtils.Dialog.Error("请输入手机号", function () {
            $("#txtUserName4Sms").focus();
        });
        return false;
    }

    var reg = /^[\d]{11}$/g;
    if (!reg.test(mobile)) {
        AppUtils.Dialog.Error('请输入正确的手机号', function () {
            $("#txtUserName4Sms").focus();
        });
        return;
    }

    return mobile;
}

function SendSms(smsChannel) {
    smsChannel = smsChannel || 1;
    if ($('[data-smschannel=' + smsChannel + ']').hasClass("disabled"))
        return;

    SetSmsChannelDisabled(true);

    var mobile = getMobile4Sms();
    if (!mobile) {
        SetSmsChannelDisabled(false);
        return;
    }

    //send sms
    SetSmsCountdown(smsChannel);
    setTimeout(function () {
        console.log('sms code:1234');
        $("#txtSmsCode4Sms").focus();
    }, 2000);
}

function SetSmsChannelDisabled(disabled) {
    if (disabled)
        $('[data-smschannel]').addClass("disabled");
    else
        $('[data-smschannel]').removeClass("disabled");
}

function SetSmsCountdown(smsChannel) {
    window._countdown = 60;

    SetSmsChannelDisabled(true);
    countdown();

    window._smsInterval = setInterval(function () {
        if (--window._countdown == 0) {
            complete();
            clearInterval(window._smsInterval);
        } else {
            countdown();
        }
    }, 1000);

    function countdown() {
        $('a[data-smschannel="1"]').css({ "background-color": "#999", "color": "#666" }).text(window._countdown + "秒后重新获取");
        $('a[data-smschannel="2"]').removeClass("fontcolor0e83f5").addClass("fontcolor999")
            .parent().hide()
            .parent().find('[data-countdown="2"]').text(window._countdown + "秒后可再次获取语音验证码").show();
    }

    function complete() {
        $('a[data-smschannel="1"]').css({ "background-color": "#008def", "color": "#fff" }).text("发送验证码");
        $('a[data-smschannel="2"]').addClass("fontcolor0e83f5").removeClass("fontcolor999")
            .parent().show()
            .parent().find('[data-countdown="2"]').text("").hide();

        SetSmsChannelDisabled(false);
    }
}

function getCondition4Sms() {
    var mobile = getMobile4Sms();
    if (!mobile) return;

    var smsCode = $("#txtSmsCode4Sms").val();
    if (!smsCode) {
        AppUtils.Dialog.Error("请输入验证码", function () {
            $("#txtSmsCode4Sms").focus();
        });
        return false;
    }

    return {
        mobile: mobile,
        smsCode: smsCode,
        smsSN: smsSN,
        terminal: AppSettings.terminal
    };
}

function loginBySms() {
    if ($("#btnLoginBySms").hasClass("btn1a"))
        return;

    var data = getCondition4Sms();
    if (!data) return;

    data = $.extend({}, getTerminalInfo(), data);
}

// ==================== 登录成功处理↓ ====================
function onLogined(user) {
    var cookieOpts = { "path": "/" };
    if (user.IsRememberPwd) cookieOpts.expires = 7;
    $.cookie(_LoginedUserCookieName, JSON.stringify(user), cookieOpts);
    gotoMain();
}