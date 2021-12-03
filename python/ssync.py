#!/usr/bin/env python
import requests

"""
    # import and init
    import SensorSync from ssync
    s = SensorSync('192.168.2.49')

    # or
    # s = SensorSync()
    # s.ip = '192.168.2.49'


    # set and reset sensors
    # valid sensor numbers: 1..8
    OK, _ = s.activate(1)
    OK, _ = s.reset(1)

    # optionally, check the returned html when activating/resetting:
    OK, _ = s.activate(1, verify=True)
    OK, _ = s.reset(1, verify=True)

    # request status
    OK, status_html = s.status()
 
    # status_html looks like this:
        <html>
        Version 2.3
        IP=192.168.2.49
        MAC=DE.AD.BE.EF.FE.ED
        SENSORS=0
        </html>

    OK, _ = s.write_ip('192.168.2.49')
    OK, _ = s.write_mac('CA.FE.EE.CA.FE.ED')
    OK, _ = s.reboot()
"""

class SensorSync:
    APIS = {
        'activate': 'http://{ip}?activate={sensor}',
        'reset': 'http://{ip}?reset={sensor}',
        'reboot': 'http://{ip}?reboot=true',
        'status': 'http://{ip}?status=true',
        'write_ip': 'http://{ip}?ip={new_ip}',
        'write_mac': 'http://{ip}?mac={new_mac}',
    }

    def __init__(self, ip=None):
        self.ip = ip

    def _url_for(self, api, **kwargs):
        url = SensorSync.APIS[api]
        d = {'ip': self.ip}
        d.update(kwargs)
        return url.format(**d)

    def _request_url(self, url):
        assert self.ip is not None
        r = requests.get(url)
        return r.status_code, r.text

    def activate(self, sensor, verify = False):
        url = self._url_for('activate', sensor=sensor)
        s, c = self._request_url(url)
        OK = s == 200
        if verify:
            expected = '<html>\r\nOK sensor {sensor} activated\r\n</html>\r\n'.format(sensor=sensor)
            OK = OK and c == expected
        return OK, c

    def reset(self, sensor, verify = False):
        url = self._url_for('reset', sensor=sensor)
        s, c = self._request_url(url)
        OK = s == 200
        if verify:
            expected = '<html>\r\nOK sensor {sensor} reset\r\n</html>\r\n'.format(sensor=sensor)
            OK = OK and c == expected
        return OK, c

    def reboot(self, verify):
        url = self._url_for('reboot')
        s, c = self._request_url(url)
        OK = s == 200
        if verify:
            expected = '<html>\r\nOK\r\n</html>\r\n'
            OK = OK and c == expected
        return OK, c

    def status(self):
        url = self._url_for('status')
        return self._request_url(url)

    def write_ip(self, new_ip, verify = False):
        url = self._url_for('write_ip', new_ip=new_ip)
        s, c = self._request_url(url)
        OK = s == 200
        if verify:
            expected = '<html>\r\nOK\r\n</html>\r\n'
            OK = OK and c == expected
        return OK, c

    def write_mac(self, new_mac, verify = False):
        url = self._url_for('write_mac', new_mac=new_mac)
        s, c = self._request_url(url)
        OK = s == 200
        if verify:
            expected = '<html>\r\nOK\r\n</html>\r\n'
            OK = OK and c == expected
        return OK, c



def t(s, t):
    if not s:
        print('*************', end='')
        print(repr(t))
    print(f'status: {s}\n{t}')
    print('---')

if __name__ == '__main__':
    # test against device in default config mode
    s = SensorSync('192.168.2.49')
    t(*s.activate(1, verify=True))
    t(*s.reset(1, verify=True))
    t(*s.status())
    t(*s.write_ip('192.168.2.49', verify=True))
    t(*s.write_mac('CA.FE.EE.CA.FE.ED', verify=True))
    t(*s.reboot(verify=True))

