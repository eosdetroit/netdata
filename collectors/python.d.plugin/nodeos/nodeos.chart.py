# -*- coding: utf-8 -*-
# Description: nodeos netdata python.d module
# Author: bitcoiners
# SPDX-License-Identifier: GPL-3.0-or-later

from bases.FrameworkServices.UrlService import UrlService


ORDER = [
    'connections',
    'requests',
    'sync_status',
    'connect_rate',
]

CHARTS = {
    'connections': {
        'options': [None, 'Active Connections', 'connections', 'active connections',
                    'nodeos.connections', 'line'],
        'lines': [
            ['active']
        ]
    },
    'requests': {
        'options': [None, 'Requests', 'requests/s', 'requests', 'nodeos.requests', 'line'],
        'lines': [
            ['requests', None, 'incremental']
        ]
    },
    'sync_status': {
        'options': [None, 'Active Connections by Status', 'connections', 'status',
                    'nodeos.sync_status', 'line'],
        'lines': [
            ['reading'],
            ['writing'],
            ['waiting', 'idle']
        ]
    },
    'connect_rate': {
        'options': [None, 'Connections Rate', 'connections/s', 'connections rate',
                    'nodeos.connect_rate', 'line'],
        'lines': [
            ['accepts', 'accepted', 'incremental'],
            ['handled', None, 'incremental']
        ]
    }
}


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
            raw = self._get_raw_data().split(" ")
            return {'active': int(raw[2]),
                    'requests': int(raw[9]),
                    'reading': int(raw[11]),
                    'writing': int(raw[13]),
                    'waiting': int(raw[15]),
                    'accepts': int(raw[7]),
                    'handled': int(raw[8])}
        except (ValueError, AttributeError):
            return None
