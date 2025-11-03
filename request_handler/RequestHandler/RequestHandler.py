
from typing import Callable


class RequestHandler:

    _request_timeout = None
    _autosave_function = None

    def __init__(self, request_timeout: int = 5, autosave_function: Callable = None):
        self._request_timeout = request_timeout
        self._autosave_function = autosave_function

    def get(self, url: str):
        pass