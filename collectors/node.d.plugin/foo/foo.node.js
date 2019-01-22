'use strict';
// SPDX-License-Identifier: GPL-3.0-or-later
// foo node.d plugin

var netdata = require('netdata');

// the processor is needed only
// if you need a custom processor
// other than http
netdata.processors.foo_processor = {
    name: 'foo_processor',

    process: function(service, callback) {

        /* do data collection here */
	console.log("* collecting data *")
	//random numbers between 1 and 100	
	var data = {
		'random1': Math.random() * (100 - 1) + 1,
		'random2': Math.random() * (100 - 1) + 1
	};

        callback(data);
    }
};

var foo = {
    name: __filename,
    charts: {},

    processResponse: function(service, data) {
	console.log("* sending information to the netdata server *")
	/* send information to the netdata server here */

	// add the service
        if(service.added !== true)
		service.commit();

	var id = 'foo.random';
	var chart = foo.charts[id];

        if(typeof chart === 'undefined') {
		chart = {
		        id: 'foo.random',                         
		        name: 'foo.random',                           
		        title: "A random number (foo.random)",    
		        units: "random number",                      
		        type: "foo",                                    
		        priority: 90000,                                
		        update_every: service.update_every,             
		        dimensions: {
				'random1': { "name": "random1" },
				'random2': { "name": "random2" }
		        }
		};

		chart = service.chart(id, chart);
		foo.charts[id] = chart;

	}

	service.begin(chart);
	service.set('random1', data["random1"]);
	service.set('random2', data["random2"]);
	service.end();

    },

    configure: function(config) {
        var eligible_services = 1;

        netdata.service({
                name: 'foo',
                update_every: this.update_every,
                module: this,
                processor: netdata.processors.foo_processor,
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
