import { runStrategy } from './strategies/original-cloud-fractal-strategy.ts'
import { env } from './constants.ts'
import { getCandles } from './helpers/binance.ts'



// const binanceCandles = await getCandles('4h', 152)

Deno.cron("Run strategy", "* * * * *" ?? '', async () => {
    const candles = await (await fetch('https://api-pub.bitfinex.com/v2/candles/trade%3A4h%3AtBTCUSD/hist?limit=152')).json()
    console.log(candles[151])
    // await runStrategy()
}, {
    backoffSchedule: [1000, 5000, 10000],
});
