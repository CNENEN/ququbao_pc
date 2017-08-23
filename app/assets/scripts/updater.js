var child_process = require('child_process');
var os = require('os');
var path = require('path');
var fs = require('fs');

var platform = process.platform;
platform = /^win/.test(platform) ? 'win' : /^darwin/.test(platform) ? 'mac' : 'linux' + (process.arch == 'ia32' ? '32' : '64');

//初始化
var updater = function (options) {
    this.options = {
        temporaryDirectory: options && options.temporaryDirectory || os.tmpdir(),
        appName: options && options.appName || path.parse(process.execPath).name,
    };
}

//检查新版本
updater.prototype.checkNewVersion = function (cb) {
    cb(true, {});
}

updater.prototype.getAppPath = function () {
    var appPath = {
        mac: path.join(process.cwd(), '../../..'),
        win: path.dirname(process.execPath)
    };
    appPath.linux32 = appPath.win;
    appPath.linux64 = appPath.win;
    return appPath[platform];
};

/**
 * Returns current application executable
 * @returns {string}
 */
updater.prototype.getAppExec = function () {
    var execFolder = this.getAppPath();
    var exec = {
        mac: '',
        win: this.options.appName + path.extname(process.execPath),
        linux32: this.options.appName + path.extname(process.execPath),
        linux64: this.options.appName + path.extname(process.execPath)
    };
    return path.join(execFolder, exec[platform]);
};

//下载
updater.prototype.download = function (url, cb) {
    var pkg = request(url, function (err, response) {
        if (err) cb(err);
        if (response && (response.statusCode < 200 || response.statusCode >= 300)) {
            pkg.abort();
            return cb(new Error(response.statusCode));
        }
    });
    pkg.on('response', function (response) {
        if (response && response.headers && response.headers['content-length']) {
            pkg['content-length'] = response.headers['content-length'];
        }
    });
    var filename = path.basename(url),
        destinationPath = path.join(this.options.temporaryDirectory, filename);
    // download the package to template folder
    fs.unlink(path.join(this.options.temporaryDirectory, filename), function () {
        pkg.pipe(fs.createWriteStream(destinationPath));
        pkg.resume();
    });
    pkg.on('error', cb);
    pkg.on('end', appDownloaded);
    pkg.pause();

    function appDownloaded() {
        process.nextTick(function () {
            if (pkg.response.statusCode >= 200 && pkg.response.statusCode < 300) {
                cb(null, destinationPath);
            }
        });
    }
    return pkg;
}

updater.prototype.update = function (source) {
    var destination = this.getAppExec();
    fs.rename(source, destination, function (err) {
        if (err) {
            console.log(err); return;
        }
        fs.stat(destination, function (err, stats) {
            if (err) throw err;
            console.log('stats: ' + JSON.stringify(stats));
        });
       
    })
}

updater.prototype.reboot = function(){
    if (platform == "mac") {
        child = child_process.spawn("open", ["-n", "-a", process.execPath.match(/^([^\0]+?\.app)\//)[1]], { detached: true });
    } else {
        child = child_process.spawn(this.getAppExec(), [], { detached: true });
    }
    child.unref();
    process.exit();
}