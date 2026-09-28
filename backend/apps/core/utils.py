def safe_float(v, default=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default

def inr(n):
    try:
        return f"Rs.{int(round(float(n))):,}".replace(",", ",")
    except (TypeError, ValueError):
        return "Rs.0"
