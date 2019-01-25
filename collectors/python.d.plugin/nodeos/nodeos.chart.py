# -*- coding: utf-8 -*-
# Description: nodeos netdata python.d module
# Author: bitcoiners
# SPDX-License-Identifier: GPL-3.0-or-later

from bases.FrameworkServices.UrlService import UrlService
import json
import dateutil
import datetime
from dateutil.parser import parse


ORDER = [
    'sync',
    'ram'
]

CHARTS = {
    'sync': {
        'options': [None, 'Synchronization', 'ms', 'sync', 'nodeos.sync', 'line'],
        'lines': [
            ['latency']
        ]
    },
    'ram': {
        'options': [None, 'RAM', '%', 'ram', 'nodeos.ram', 'stacked'],
        'lines': [
            ['free', 'free', 'percentage-of-absolute-row'],
            ['used', 'used', 'percentage-of-absolute-row']
        ]
    }	
}

#        'options': [name, title, units, family, context, charttype],
#        'lines': [
#            [unique_dimension_name, name, algorithm, multiplier, divisor]



class Service(UrlService):
    def __init__(self, configuration=None, name=None):
        UrlService.__init__(self, configuration=configuration, name=name)
        self.order = ORDER
        self.definitions = CHARTS
        self.url = self.configuration.get('url')

    def _get_data(self):
        """
        Format data received from http request
        :return: dict
        """
        try:
        	data = json.loads(self._get_raw_data(self.url + '/v1/chain/get_info'))
		head_block_time = parse(data["head_block_time"])
		now = datetime.datetime.now()
		diff = (now - head_block_time).total_seconds() + self.configuration.get('timezone_offset') * 60 * 60
#	    	import pdb; pdb.set_trace()
		result = {
			'head_block_num': int(data["head_block_num"]),
			'latency': diff * 1000
		}
		#db_size
		data = json.loads(self._get_raw_data(self.url + '/v1/db_size/get'))
		result['free'] = int(data['free_bytes']) #/ 1048576
		result['used'] = int(data['used_bytes'])
		result['size'] = int(data['size']) 
            	return result
        except (ValueError, AttributeError):
            return None
