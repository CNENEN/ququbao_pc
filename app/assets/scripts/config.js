var path = require('path');
var fs = require('fs');

function writeConfig(dataPath, cfg) {
    console.log("write config");
    var cfgPath = path.join(dataPath, "cfg.json");
    fs.writeFileSync(
        cfgPath,
        JSON.stringify(cfg),
        {
            encoding : 'utf8'
        }
    );
}

function loadConfig(dataPath) {
    var cfgPath = path.join(dataPath, "cfg.json");
    console.log("cfg path:" + cfgPath);

    var cfg = {}
    try {
        var buf = fs.readFileSync(cfgPath, {encoding : 'utf8'});
        cfg = JSON.parse(buf);
    } catch(e) {
        //首次启动，配置文件不存在
        console.log("e:" + e);
    }

    var needWrite = false;
    if (!cfg.hasOwnProperty("autoStart")) {
        console.log("no autoStart property");
        cfg.autoStart = true;
        needWrite = true;
    }

    if (!cfg.hasOwnProperty("silent")) {
        console.log("no silent property");
        cfg.silent = false;
        needWrite = true;
    }

    if (needWrite) {
        writeConfig(dataPath, cfg);
    }

    return cfg;
}

exports.writeConfig = writeConfig;
exports.loadConfig = loadConfig;
