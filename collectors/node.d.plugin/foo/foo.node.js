'use strict';
// SPDX-License-Identifier: GPL-3.0-or-later
// Example node.d plugin

var netdata = require('netdata');

// the processor is needed only
// if you need a custom processor
// other than http
netdata.processors.foo_processor = {
    name: 'foo_processor',

    process: function(service, callback) {

        /* do data collection here */
	console.log("* collecting data *")	
	var data = {};

        callback(data);
    }
};

// this is the foo definition
var foo = {
    processResponse: function(service, data) {

        /* send information to the netdata server here */
	console.log("* sending information to the netdata server *")	

    },

    configure: function(config) {
        var eligible_services = 1;

        netdata.service({
                name: 'foo',
                update_every: this.update_every,
                module: this,
                processor: netdata.processors.foo_processor,
                // any other information your processor needs
            }).execute(this.processResponse);

        return eligible_services;
    },

    update: function(service, callback) {

        /*
         * this function is called when each service
         * created by the configure function, needs to
         * collect updated values.
         *
         * You normally will not need to change it.
         */

        service.execute(function(service, data) {
            foo.processResponse(service, data);
            callback();
        });
    },
};

module.exports = foo;
