"""Tiny in-memory TTL cache so we don't hammer free public APIs."""
import time

_STORE: dict = {}

def get(key):
    item = _STORE.get(key)
    if not item:
        return None
    value, exp = item
    if exp < time.time():
        _STORE.pop(key, None)
        return None
    return value

def set(key, value, ttl=3600):
    _STORE[key] = (value, time.time() + ttl)
