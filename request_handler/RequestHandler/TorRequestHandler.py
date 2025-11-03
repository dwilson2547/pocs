from typing import Callable
from requests_html import HTMLSession
from fake_useragent import UserAgent
from stem import Signal
from stem.control import Controller

class TorRequestHandler():

    _requests_before_new_ip = None
    _failures_before_new_ip = None
    tor_proxy_port = None
    tor_config_port = None
    _tor_proxies = None

    _current_ip_requests = 0
    _current_ip_failures = 0
    _user_agent = None

    _session = None

    def __init__(self, tor_proxy_port: int = 9050, tor_config_port: int = 9051, tor_proxy_ip: str = '127.0.0.1',
        tor_proxy_protocol = 5, request_timeout: int = 5, requests_before_new_ip: int = 15, failures_before_new_ip: int = 3,
        autosave_function: Callable = None):
        """
        TorRequestHandler, your one stop shop for sending requests and rotating ips on the tor network

        :param tor_proxy_port: int, default is 9050
        tor_config_port: int, default is 9051
        tor_proxy_ip: str, default is 127.0.0.1
        tor_proxy_protocol: ['h', 'H', 4, 5] default is 5 for socks5, other values are 4 for socks4 and 'h' or 'H' for http
        request_timeout: int, default is 5, number of seconds before raising timeout error on request
        requests_before_new_ip: int, default is 15, number of requests before rotating ip addresses (to avoid ip bans)
        failures_before_new_ip: int, default is 3, number of request failures before rotating ip addresses
        autosave_function: function, when a critical exception is raised this function will be called before the exception is re-raised.
            Useful if your application is capable of stopping and resuming
        
        """

        self._requests_before_new_ip = requests_before_new_ip
        self._failures_before_new_ip = failures_before_new_ip
        self.tor_proxy_port = tor_proxy_port
        self.tor_config_port = tor_config_port
        self._request_timeout = request_timeout
        self._autosave_function = autosave_function

        if tor_proxy_protocol not in ['h', 'H', 4, 5]:
            raise ValueError('Tor proxy protocol was unexpected value, valid entries are: "h" or "H" for http, 4 for socks4, and 5 for socks5')

        self._tor_proxies = self._build_tor_proxies(tor_proxy_protocol, tor_proxy_ip, tor_proxy_port)

        self._session = HTMLSession()
        self._user_agent = UserAgent().random

    def get(self, url: str):
        """
        Get, returns a response object for the provided url. This function also keeps track of how many requests succeed and fail and 
        calls the rotate_ips function at the (constructor) provided intervals.

        url: str
        return: Response
        """
        page = None

        while not page:
            try:
                page = self._make_request(url)
                self._current_ip_requests += 1
                if self._current_ip_requests >= self._requests_before_new_ip:
                    self.rotate_ips()
            except Exception as ex:
                print(f'Exception raised while requesting url: {url}')
                self._current_ip_failures += 1
                if self._current_ip_failures >= self._failures_before_new_ip:
                    self.rotate_ips()

        return page

    def _make_request(self, url: str):
        return self._session.get(url, proxies=self._tor_proxies, headers={'User-Agent': self._user_agent}, timeout=self._request_timeout)

    def rotate_ips(self):
        """
        Rotate ips, as you might imagine this function triggers an ip refresh using the stem controller class. If an exception
        is raised, this calls the autosave function and then re-raises it.

        return: void
        """
        try:
            with Controller.from_port(port = self.tor_config_port) as c:
                c.authenticate()
                c.signal(Signal.NEWNYM)
            self._user_agent = UserAgent().random
            self._current_ip_requests = 0
            self._current_ip_failures = 0
        except Exception as ex:
            print('Exception raised while rotating ips')
            if self._autosave_function:
                self._autosave_function()
            raise ex

    def _build_tor_proxies(self, tor_proxy_protocol, tor_proxy_ip: str, tor_proxy_port: int):
        proxy = tor_proxy_ip + ':' + str(tor_proxy_port)
        if tor_proxy_protocol in [4,5]:
            return {
                'http': 'socks' + str(tor_proxy_protocol) + '://' + proxy,
                'https': 'socks' + str(tor_proxy_protocol) + '://' + proxy
            }
        elif tor_proxy_protocol in ['h', 'H']:
            return {
                'http': proxy,
                'https': proxy,
            }
        else:
            print('How the hell did you manage that?')
            # Not bothering with autosave here, this will be raised by the constructor
            raise ValueError('Invalid proxy protocol passed to _build_tor_proxies function, expected one of ["h", "H", 4, 5] but received: ' + str(tor_proxy_protocol))