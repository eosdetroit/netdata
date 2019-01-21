'use strict';
// SPDX-License-Identifier: GPL-3.0-or-later


require('url');
require('http');
var netdata = require('netdata');
//var datetime = require('node-datetime');

if(netdata.options.DEBUG === true) netdata.debug('loaded ' + __filename + ' plugin');

var nodeos = {
    name: __filename,
    base_priority: 60000,
    charts: {},

    processResponse: function(service, data) {
	/* send information to the netdata server here */
	console.log("processResponse...");
        if(data !== null) {
            var json = JSON.parse(data);
	    console.log(json);

            // add the service
            if(service.added !== true)
                service.commit();

            // Blocks Chart
            if(json.head_block_time !== null) {
                var id = 'nodeos.blocks'; // + service.name + '.current';
                var chart = nodeos.charts[id];

                if(typeof chart === 'undefined') {
                    chart = {
                        id: id,                                         // the unique id of the chart
                        name: '',                                       // the unique name of the chart
                        title: service.name + ' Current Blocks',    // the title of the chart
                        units: 'seconds',                        // the units of the chart dimensions
                        family: 'now',                                  // the family of the chart
                        context: 'nodeos.blocks',                // the context of the chart
                        type: netdata.chartTypes.area,                  // the type of the chart
                        priority: nodeos.base_priority + 1,             // the priority relative to others in the same family
                        update_every: service.update_every,             // the expected update frequency of the chart
                        dimensions: {
                            'latency': {
                                id: 'latency',                               // the unique id of the dimension
                                name: 'latency',                              // the name of the dimension
                                algorithm: netdata.chartAlgorithms.absolute,// the id of the netdata algorithm
                                multiplier: 1,                              // the multiplier
                                divisor: 1,                                 // the divisor
                                hidden: false                               // is hidden (boolean)
                            }
                        }
                    };

                    chart = service.chart(id, chart);
                    nodeos.charts[id] = chart;
                }

                service.begin(chart);
		//var head = datetime.create(json.head_block_time);
		//var now = datetime.create().getTime();
		//var diff = ((now - head.getTime()) / 1000).toFixed(0);
                service.set('latency', 5); //json.head_block_time);
                service.end();
            }
        }
    },

    // module.serviceExecute()
    // this function is called only from this module
    // its purpose is to prepare the request and call
    // netdata.serviceExecute()
    serviceExecute: function(name, api_endpoint, update_every) {
        if(netdata.options.DEBUG === true) netdata.debug(this.name + ': ' + name + ': api_endpoint: ' + api_endpoint + ', update_every: ' + update_every);

        var service = netdata.service({
            name: name,
            request: netdata.requestFromURL(api_endpoint + '/v1/chain/get_info'),
            update_every: update_every,
            module: this
        });
        service.execute(this.processResponse);
    },

    configure: function(config) {
        var added = 0;

        if(typeof(config.servers) !== 'undefined') {
            var len = config.servers.length;
            while(len--) {
                if(typeof config.servers[len].update_every === 'undefined')
                    config.servers[len].update_every = this.update_every;

                if(config.servers[len].update_every < 5)
                    config.servers[len].update_every = 5;

                this.serviceExecute(config.servers[len].name, config.servers[len].api_endpoint, config.update_every);
                added++;
            }
        }

        return added;
    },

    // module.update()
    // this is called repeatidly to collect data, by calling
    // netdata.serviceExecute()
    update: function(service, callback) {
        service.execute(function(serv, data) {
            service.module.processResponse(serv, data);
            callback();
        });
    },
};

module.exports = nodeos;
