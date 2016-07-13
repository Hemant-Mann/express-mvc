var Utils = require('../scripts/utils');
var seo = require('../config/seo');

/**
 * Create a regular expression for matching URL
 * for following MVC pattern
 * Eg: if url = "/users/login" i.e "/{controller}/{method}" where method will be
 * a function of the controller
 * Given a controller it will match the method from the URL
 */
var publicMethods = function (controller) {
    
};

/**
 * Shared Controller
 */
var Controller = (function () {
    'use strict';

    function Controller() {
        this.seo = seo;
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
        _noview: function () {
            this.willRenderLayoutView = false;
            this.willRenderActionView = false;
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
                    return false;
                }
            } else if (self.defaultExtension == "json") {
                if (!self.willRenderActionView || !self.willRenderLayoutView) {
                    return false;
                }
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
        }
    };

    return Controller;
}());

module.exports = Controller;
