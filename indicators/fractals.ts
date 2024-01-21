// Williams Fractal calculation from candles.

import { getCandles } from '../helpers/binance.ts'

const getUpFractal = (candleHighs: string[]) => {
    let upFractals: number[] = []
    candleHighs.forEach((candle, index) => {
        const forward1 = candleHighs[index + 1] < candle
        const forward2 = candleHighs[index + 2] < candle
        const backward1 = candleHighs[index - 1] < candle
        const backward2 = candleHighs[index - 2] < candle

        if (forward1 && forward2 && backward1 && backward2) {
            upFractals.push(Number(Number(candle).toFixed(2)))
        }
    })
    return upFractals
}

const getDownFractal = (candleLows: string[]) => {
    const downFractals: number[] = []
    candleLows.forEach((candle: string, index: number) => {
        const forward1 = candleLows[index + 1] > candle
        const forward2 = candleLows[index + 2] > candle
        const backward1 = candleLows[index - 1] > candle
        const backward2 = candleLows[index - 2] > candle

        if (forward1 && forward2 && backward1 && backward2) {
            downFractals.push(Number(Number(candle).toFixed(2)))
        }
    })
    return downFractals
}

export const williamsFractals = async (timeframe: string) => {
    const res = await getCandles(timeframe)
    console.log(res)

    const candles = res.slice(0, 41).reverse()

    const candleHighs = candles.map((high: string[]) => high[2])
    const candleLows = candles.map((low: string[]) => low[3])
    const upFractals = getUpFractal(candleHighs)
    const downFractals = getDownFractal(candleLows)
    return { upFractals,  downFractals }
}
