var Utils = require('../scripts/utils');
var seo = require('../config/seo');

var getSeo = function () {
    var obj = Utils.copyObj(seo);
    return obj;
};

/**
 * Shared Controller
 */
var Controller = (function () {
    'use strict';

    function Controller() {
        this.seo = getSeo();
        this.__class = '';
        this.willRenderLayoutView = true;
        this.willRenderActionView = true;
        this.defaultLayout= 'layouts/standard';
        this.defaultExtension = "html";
        this.method = ''; // will store the method which has been called
        this.view = {}; // Properties set on this object can be accessed in views
        this.secure = [];   // Array to hold which functions needs authorization before executing
    }

    /**
     * Shared methods which can be referenced using "this.parent" should go on prototype
     * Contains methods shared with all children
     * Private Methods => starts with "_"
     * Public methods will be generally responsible for rendering views
     * and handling request
     */
    Controller.prototype = {
        _init: function (req, res, next, opts) {
            if (!opts) opts = {};
            var self = this,
                method = opts.method || (req.params[0]);

            self._initView();   // Default Settings for views

            if (!method) {
                var err = new Error("Invalid URL"); err.status = 400;
                return next(err);
            }
            // set method and extension
            self.method = method;
            self.defaultExtension = Utils.getExtension(req.url);

            self._secure(req, res); // Checks if the user is allowed to request the method
            
            // call the method to handle the request
            self[method](req, res, function (err) {
                if (err && err instanceof Error) {
                    return next(err);
                } else {
                    self._render(res, next);
                }
            });
        },
        _jsonView: function () {
            this.defaultExtension = "json";
        },
        _render: function (res, next) {
            var self = this,
                template = self.defaultLayout,
                action = self.__class +'/' + self.method,
                view = Utils.copyObj(self.view);

            if (self.defaultExtension == "html") {
                view.__action = action;
                view.seo = self.seo;
                
                if (this.willRenderLayoutView) {
                    view.__action = '../' + view.__action;
                    res.render(template, view);
                } else if (this.willRenderActionView) {
                    res.render(action, view);
                } else {
                    return next(Error("Internal Server Error"));
                }
            } else if (self.defaultExtension == "json") {
                res.json(self.view);
            } else {
                var err = new Error("Invalid URL");
                err.status = 400;
                next(err);
            }
        },
        _secure: function (req, res) {
            var self = this;
            if (self.secure.length < 0 || self.secure.indexOf(self.method) === -1) {
                return true;
            }

            if (!req.user) {    // Generally checks for authenticated user
                req.session.previousPath = req.originalUrl
                return false;
            }

            return true;
        },
        _public: function () {
            var properties = [],
                prop,
                regexString = "",
                self = this;

            for (prop in self) {
                if (prop.match(/^_.*/i) || typeof self[prop] !== "function") continue;
                properties.push(prop);
            }

            regexString += '^/(';
            regexString += properties.join('|');
            regexString += ')\.?(html|json)?$';

            return new RegExp(regexString);
        },
        _initView: function () {
            this.view = {}; // restore view object
            this.willRenderLayoutView = true;
            this.willRenderActionView = true;
            this.defaultLayout= 'layouts/standard';
            this.seo = getSeo();
        },
        /**
         * Given an array of strings it will form a regular expression
         * It will match "/login" || "/register"
         * @param  {Array} urls       Array of strings (containing URL matches) ["login", "register"]
         * @param  {Array} extensions Array of extensions ["html", "json"]
         * @return {RegExp}            returns a new Regular Expression
         */
        _makeRegex: function (urls, extensions) {
            var regexString = '^/(';
            regexString += urls.join('|');
            regexString += ')';

            if (extensions && extensions.length > 0) {
                regexString += '\.?(' + extensions.join('|') + ')?';
            }
            regexString += '$';

            return new RegExp(regexString);
        }
    };

    return Controller;
}());

module.exports = Controller;
