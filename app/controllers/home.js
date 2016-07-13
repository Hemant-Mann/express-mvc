var Shared = require('./controller');
var Utils = require('../scripts/utils');

/**
 * Home Controller
 */
var Home = (function () {
    'use strict';

    var h = Utils.inherit(Shared, 'Home');
    /**
     * Override parent method, set variables which are common
     * to all the views. When overriding don't foreget to call the
     * parent method
     */
    h._initView = function () {
        this.parent._initView.call(this);    // calling parent method in "this" reference
        this.view.message = "Hey this is home controller";
    };
    
    // Dont forget to call next or else request will never be complete
    h.index = function (req, res, next) {
        next();   // pass control to the calling function
    };

    h.jsonView = function (req, res, next) {
        this._jsonView();   // sends the json encoded data set to view in this method
        // and anything else which is common to all the views

        this.view.user = {
            prop: "Some property",
            arr: [12, 334, 334]
        };
        next();
    };

    return h;
}());

module.exports = Home;
