import { env } from '../constants.ts'


export const getCandles = async (timeframe: string, limit = 42) => {
    return await (await fetch(`${env.BINANCE_API_URL}/klines?symbol=BTCUSDT&interval=${timeframe}&limit=${limit}`)).json()
}