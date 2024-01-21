

export const getCandles = async (timeframe: string, limit = 42) => {
    return await (await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=${limit}`)).json()
}