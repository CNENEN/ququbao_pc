/*
作者：L
类名：Loading
中文名：加载中
 
创建：2014-11-18
版本号：1.0.0.0
*/

function Loading(image) {
    var _root = this;
    var _dom = null;

    // 基本配置
    this.Config = {
        Image: image || "" //默认Loading图片
    };

    // 事件
    this.Events = {
        //Render: function () { }
    }

    // 查找内部对象返回jquery对象
    this.Ele = function (e) {
        return _dom.find(e);
    }

    // 内部使用变量
    this.vars = {
        //滚动条
        BodyX: null,
        BodyY: null,
        IsShow: false
    }

    //不允许移动
    if (document.addEventListener) document.addEventListener("touchstart", function (e) { if (_root.vars.IsShow) e.preventDefault(); }, false);

    // 呈现
    this.Show = function (image) {
        _root.vars.IsShow = true;
        var body = $(document.body);
        _root.vars.BodyX = $(document.body).css("overflow-x");
        _root.vars.BodyY = $(document.body).css("overflow-y");
        if (_dom == null) {
            var HTML = [];
            HTML.push("<div class='html-loading-back'></div>");
            HTML.push("<div class='html-loading-css'></div>");
            _dom = body.append(HTML.join("")).find(".html-loading-back:last,.html-loading-css:last");
        }
        if (image != null) _root.Config.Image = image;
        if (_root.Config.Image) _dom.eq(1).removeClass("html-loading-css").addClass("html-loading-img").css("background-image", "url(" + _root.Config.Image + ")");
        else _dom.eq(1).removeClass("html-loading-img").removeAttr("style").addClass("html-loading-css");
        _ClearActive(document);
        body.css("overflow-x", "hidden");
        //body.css("overflow-y", "hidden");
        _dom.show();
        return _root;
    };

    //隐藏
    this.Hide = function () {
        if (_dom != null && _root.vars.IsShow) {
            _root.vars.IsShow = false;
            _dom.hide();
            var body = $(document.body);
            body.css("overflow-x", _root.vars.BodyX);
            body.css("overflow-y", _root.vars.BodyY);
        }
    }

    //清除焦点控件
    var _ClearActive = function (doc) {
        try {
            if (!doc) doc = window.document;
            if (doc && doc.activeElement) {
                var obj = $(doc.activeElement);
                if (obj.is("input,a,button,textarea")) obj.blur();
            }
        } catch (e) {
        }
    }
}