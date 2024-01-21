
export const getCandles = async (timeframe: string, limit = 42, reverse = false) => {
    const candles = await (await fetch(`https://api-pub.bitfinex.com/v2/candles/trade%3A${timeframe}%3AtBTCUSD/hist?limit=${limit}`)).json()

    if (reverse) candles.reverse()

    return candles
}
