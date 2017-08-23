(function (window) {
        const utils = {
            gui: (function () {
                try {
                    return require('nw.gui');
                }
                catch (e) {
                }
    
                return null;
            })(),
    
            // 获取NW终端设备信息
            getTerminalInfo4NW: function () {
                var os = null;
                try {
                    os = require('os');
                }
                catch (e) {
                }
    
                if (!os) return {};
    
                return {
                    terminalManufactor: os.type(),
                    terminalModel: os.platform(),
                    osInfo: os.arch()
                };
            },
    
            // 跳转登录页
            gotoLogin: function (e) {
                if (utils.gui) {
                    utils.gui.Window.open("dist/login.html?msg=" + encodeURIComponent(e.msg), {
                        "width": 280,
                        "height": 400,
                        "resizable": false,
                        "show": true,
                        "frame": false,
                        "focus": true
                    });
                    utils.win.close();
                } else {
                    window.location.href = "login.html?msg=" + encodeURIComponent(e.msg);
                }
            },
    
            // 跳转主页
            gotoMain: function () {
                if (utils.gui) {
                    utils.gui.Window.open("dist/index.html", {
                        "min_width": 960,
                        "min_height": 600,
                        "width": 960,
                        "height": 600,
                        "show": true,
                        "frame": false,
                        "focus": true
                    });
                    utils.win.close();
                } else {
                    window.location.href = "index.html";
                }
            }
        };
    
        utils.win = utils.gui === null ? null : utils.gui.Window.get();
        window.NWUtils = utils;
    
    })(window);
    
    (function (window) {
    
        if (!window.NWUtils.gui) return;
    
        var gui = window.NWUtils.gui;
        var win = window.NWUtils.win;
    
        // 重置主窗口
        process.mainModule.exports.setMainWindow(win);
    
        // 标题
        win.title = '蛐蛐宝';
        win.show();
        // 创建托盘
        if (!process.mainModule.exports.backgroundWindow) {
            gui.Window.open('../views/tray.html', {
                "show": false
            }, function (backgroudWin) {
                process.mainModule.exports.backgroundWindow = backgroudWin;
            });
        }
    
        // 清除托盘消息
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
    
        window.onload = function () {
            // 最大化/还原
            var maxBar = document.getElementById('titlebar_max');
            maxBar && maxBar.addEventListener('click', function (e) {
                if (isMaximize) {
                    win.restore();
                } else {
                    win.maximize();
                }
            });
    
            // 最小化
            var minBar = document.getElementById('titlebar_min');
            minBar && minBar.addEventListener('click', function (e) {
                win.minimize();
            });
    
            // 关闭
            var closeBar = document.getElementById('titlebar_close');
            closeBar && closeBar.addEventListener('click', function (e) {
                win.close();
            });
    
            // 禁用右键
            document.body.oncontextmenu = function () { return false; };
            // 禁止接收拖放文件
            window.ondragover = function (e) { e.preventDefault(); return false };
            window.ondrop = function (e) { e.preventDefault(); return false };
            // 禁止图片拖动
            for (i in document.images) document.images[i].ondragstart = function () { return false; };
        }
    
    })(window);    