module.exports = function (grunt) {
    grunt.initConfig({
        nwjs: {
            options: {
                platforms: ['win'],
                buildDir: './dist',
                version: '0.22.3',
                macIcns: "assets/osx/ququbao.icns",
                macPlist: {
                    "CFBundleIdentifier": "ttifa",
                },
                winIco: "assets/win/ququbao.ico",
            },
            src: [
                './app/package.json',
                './app/application.js',
                './app/assets/**/*',
                './app/views/**/*',
                './app/dist/**/*'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-nw-builder');
}
