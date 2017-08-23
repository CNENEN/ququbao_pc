export default class Loading {
    constructor(image) {
        var _root = this;
        this._dom = null;

        // 基本配置
        this.Config = {
            Image: image || '' //默认Loading图片
        };

        // 事件
        this.Events = {
            //Render: function () { }
        };

        // 查找内部对象返回jquery对象
        this.Ele = function (e) {
            return this._dom.find(e);
        };

        // 内部使用变量
        this.vars = {
            //滚动条
            BodyX: null,
            BodyY: null,
            IsShow: false
        };

        //不允许移动
        if (document.addEventListener) document.addEventListener('touchstart', function (e) { if (_root.vars.IsShow) e.preventDefault(); }, false);
    }

    // 呈现
    Show(image) {
        this.vars.IsShow = true
        var body = $(document.body)
        this.vars.BodyX = $(document.body).css('overflow-x')
        this.vars.BodyY = $(document.body).css('overflow-y')
        if (this._dom == null) {
            var HTML = []
            HTML.push('<div class="html-loading-back"></div>')
            HTML.push('<div class="html-loading-css"></div>')
            this._dom = body.append(HTML.join('')).find('.html-loading-back:last,.html-loading-css:last')
        }
        if (image != null) this.Config.Image = image
        if (this.Config.Image) this._dom.eq(1).removeClass('html-loading-css').addClass('html-loading-img').css('background-image', 'url(' + this.Config.Image + ')')
        else this._dom.eq(1).removeClass('html-loading-img').removeAttr('style').addClass('html-loading-css')
        _ClearActive(document)
        body.css('overflow-x', 'hidden')
        //body.css('overflow-y', 'hidden')
        this._dom.show()
        return this
    };

    //隐藏
    Hide() {
        if (this._dom != null && this.vars.IsShow) {
            this.vars.IsShow = false
            this._dom.hide()
            var body = $(document.body)
            body.css('overflow-x', this.vars.BodyX)
            body.css('overflow-y', this.vars.BodyY)
        }
    }
}

//清除焦点控件
var _ClearActive = function (doc) {
    try {
        if (!doc) doc = window.document
        if (doc && doc.activeElement) {
            var obj = $(doc.activeElement)
            if (obj.is('input,a,button,textarea')) obj.blur()
        }
    } catch (e) {
    }
}