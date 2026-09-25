def calculate_max_affordable_price(income: float, deposit: float, multiplier: float, first_time_buyer: bool, shared_ownership: bool = False, share_percent: float = 100) -> float:
    adjusted_multiplier = multiplier + 0.5 if first_time_buyer else multiplier
    share = share_percent / 100 if shared_ownership else 1
    return (income * adjusted_multiplier + deposit) / share


def calculate_stamp_duty(price: float, first_time_buyer: bool) -> float:
    if first_time_buyer:
        if price <= 425000:
            return 0
        elif price <= 625000:
            return (price - 425000) * 0.05
    else:
        if price <= 250000:
            return 0
        elif price <= 925000:
            return (price - 250000) * 0.05
    return 0  # basic fallback