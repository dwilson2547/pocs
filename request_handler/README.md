# request_handler

This is intended to be a package for request handling, currently it only contains the RequestHandler interface and the TorRequestHandler class.

The TorRequestHandler expects the user to have tor setup and running on their system. All configuration values are entered into the constructor and are as follows:

* tor_proxy_port: int = 9050
    * integer value of tor proxy port
* tor_config_port: int = 9051
    * integer value of tor configuration port
* tor_proxy_ip: str = '127.0.0.1'
    * string value of tor config port
* tor_proxy_protocol = 5
    * Tor proxy protocol, One of ['h', 'H', 4, 5], 'h' and 'H' for http, 4 for socks4, and 5 for socks5
* request_timeout: int = 5
    * number of seconds to wait before killing the connection
* requests_before_new_ip: int = 15
    * number of successful requests before rotating ip address
* failures_before_new_ip: int = 3 
    * number of failed requests before rotating ip address
* autosave_function: Callable = None
    * Callable that will be called before re-raising any terminal exceptions

