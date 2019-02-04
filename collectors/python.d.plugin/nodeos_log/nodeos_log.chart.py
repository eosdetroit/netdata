# -*- coding: utf-8 -*-
# Description: Nodeos log netdata python.d module
# Author: bitcoiners
# SPDX-License-Identifier: GPL-3.0-or-later

import bisect
import re
import os

from collections import namedtuple, defaultdict
from copy import deepcopy

try:
    from itertools import filterfalse
except ImportError:
    from itertools import ifilter as filter
    from itertools import ifilterfalse as filterfalse

try:
    from sys import maxint
except ImportError:
    from sys import maxsize as maxint

from bases.collection import read_last_line
from bases.FrameworkServices.LogService import LogService

from sh import tail
import dateutil
import datetime as DT
from dateutil.relativedelta import *
from dateutil.parser import parse

#import pdb; 


class Service(LogService):
    def __init__(self, configuration=None, name=None):
        LogService.__init__(self, configuration=configuration, name=name)
        self.configuration = configuration
        self.log_path = self.configuration.get('path')
        self.order = [
	    'blocks_produced'
	]
        self.definitions = {
	    'blocks_produced': {
		'options': [None, 'Produced Blocks', 'blocks/round', 'blocks', 'nodeos_log.blocks_produced', 'line'],
		'lines': [
		    ['produced', self.configuration.get('producer')]
		]
	    }
	}

    def check(self):
        if not self.log_path:
            self.error('log path is not specified')
            return False

        if not (self._find_recent_log_file() and os.access(self.log_path, os.R_OK)):
            self.error('{log_file} not readable or not exist'.format(log_file=self.log_path))
            return False

        if not os.path.getsize(self.log_path):
            self.error('{log_file} is empty'.format(log_file=self.log_path))
            return False

        last_line = read_last_line(self.log_path)
        if not last_line:
            return False
        return True

    def _get_data(self):
        try:
        	data = {'produced': 0}
		search = []
		now = DT.datetime.now()
		last = now+relativedelta(seconds=-126)
		for line in tail("-n 500", self.log_path, _iter=True):
			if "Received block" in line or "Produced block" in line:
				match = re.match( r'.*info  (.*) thread.* signed by (.*) \[.*', line)
				info = {'date': match.group(1), 'producer': match.group(2) }
				date = parse(info["date"])
				offset = -self.configuration.get('timezone_offset') * 3600 if self.configuration.get('timezone_offset') else 0
				date = date+relativedelta(seconds=offset)
			    	#pdb.set_trace()			
				# filtering entries for the last 126 seconds
				if date > last and date < now or date == now:
					search.append(info)
					if info['producer'] == self.configuration.get('producer'):
						data['produced'] += 1
		
		return data
        except (ValueError, AttributeError):
            return None
