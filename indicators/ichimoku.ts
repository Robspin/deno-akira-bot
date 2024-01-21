// ichimoku cloud with 20 60 120 30 as settings

import { getCandles } from '../helpers/binance.ts'

let priceAboveTenkan: boolean
let bullishCross: boolean
let bullishCloud: boolean
let priceAboveCloud: boolean
let priceBelowCloud: boolean

const getTenkan = (candles: string[], slice1 = 132, slice2 = 151) => {
    const candleHigh = findHighest(candles.slice(slice1, slice2))
    const candleLow = findLowest(candles.slice(slice1, slice2))
    return (candleHigh + candleLow) / 2
}

const getKijun = (candles: string[], slice1 = 92, slice2 = 151) => {
    const candleHigh = findHighest(candles.slice(slice1, slice2))
    const candleLow = findLowest(candles.slice(slice1, slice2))
    return (candleHigh + candleLow) / 2
}

const getSenkouA = (candles: string[]) => {
    const tenkanOffset = getTenkan(candles, 103, 123)
    const kijunOffset = getKijun(candles, 63, 123)
    return (tenkanOffset + kijunOffset) / 2
}

const getSenkouB = (candles: string[]) => {
    const candleHigh = findHighest(candles.slice(3, 123))
    const candleLow = findLowest(candles.slice(3, 123))
    return (candleHigh + candleLow) / 2
}

const findHighest = (arrayAll: any[]) => {
    let array = arrayAll.map(int => int[2])
    let max = 0,
        a = array.length,
        counter

    for (counter = 0; counter< a; counter++) {
        if (array[counter] > max) {
            max = array[counter]
        }
    }
    return Number(max)
}

const findLowest = (arrayAll: any[]) => {
    const array = arrayAll.map(int => int[3])
    let min = 10000000,
        a = array.length,
        counter

    for (counter = 0; counter < a; counter++) {
        if (array[counter] < min) {
            min = array[counter]
        }
    }
    return Number(min)
}

const priceAndCloud = (candles: any[], senkouA: number, senkouB: number) => {
    if (candles[150][4] > senkouA && candles[150][4] > senkouB) {
        priceAboveCloud = true
        priceBelowCloud = false
        return 'price above cloud'
    } else if (candles[150][4] < senkouA && candles[150][4] < senkouB) {
        priceBelowCloud = true
        priceAboveCloud = false
        return 'price below cloud'
    } else {
        priceAboveCloud = false
        priceBelowCloud = false
        return 'price in cloud'
    }
}

export const ichimoku = async (timeframe: string) => {
    const candles = await getCandles(timeframe, 152)

    const tenkan = getTenkan(candles)
    const kijun = getKijun(candles)
    const senkouA = getSenkouA(candles)
    const senkouB = getSenkouB(candles)

    priceAboveTenkan = candles[150][4] > tenkan
    bullishCross = tenkan > kijun
    bullishCloud = senkouA > senkouB

    const signalDetails = `${bullishCross ? 'Bullish cross' : 'Bearish cross'}, ${bullishCloud ? 'bullish cloud' : 'bearish cloud'}, ${priceAndCloud(candles, senkouA, senkouB)}`

    if (priceAboveCloud && priceAboveTenkan && bullishCross && bullishCloud) {
        return { signal: 'LONG', signalDetails }
    } else if (
        priceBelowCloud &&
        !priceAboveTenkan &&
        !bullishCross &&
        !bullishCloud
    ) {
        return { signal: 'SHORT', signalDetails }
    } else {
        return { signal: 'NO SIGNAL', signalDetails }
    }
}
