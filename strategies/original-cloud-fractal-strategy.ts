import { env } from '../constants.ts'
import { williamsFractals } from '../indicators/fractals.ts'
import { ichimoku, Signal } from '../indicators/ichimoku.ts'
import { sendEvent } from '../helpers/event-api.ts'
import { BaseTradingClassInstance } from '../helpers/base-trading-class.ts'
import { BitfinexTradingClass } from '../helpers/bitfinex/bitfinex-trading-class.ts'
import { BitfinexBaseClient } from '../helpers/bitfinex/bitfinex-base-client.ts'

type StrategyInfo = {
    fractals:  { upFractals: number[], downFractals: number[] }
    signal: Signal
    signalDetails: string
}

export const getStrategyInfo = async (): Promise<StrategyInfo> => {
    const fractals = await williamsFractals(env.STRATEGY_FRACTAL_TIMEFRAME ?? '')
    const ichimokuSignal = await ichimoku(env.STRATEGY_ICHIMOKU_TIMEFRAME ?? '')
    const { signal, signalDetails } = ichimokuSignal

    return { fractals, signal, signalDetails }
}

export const runStrategy = async () => {
    const { fractals, signal, signalDetails } = await getStrategyInfo()

    try {
        await sendEvent(`${signal}. ${signalDetails}`)
    } catch (e) {
        console.log(e)
    }

    // if (signal !== 'LONG') return
    const bfxClient = new BitfinexBaseClient(env.BITFINEX_API_KEY ?? '', env.BITFINEX_API_SECRET ?? '')
    const tradingClient = new BitfinexTradingClass(bfxClient)

    const accountBallance = await tradingClient.getAccountBalance()
    const openTrades = await tradingClient.hasOpenTrades()
    const positionSizeUSD = await tradingClient.getPositionSizeInDollars(accountBallance)
    const positionSizeBTC = await tradingClient.getPositionSizeInBTC(accountBallance)

    console.log('accountBallance: ', accountBallance)
    console.log('openTrades: ', openTrades)
    console.log('positionSizeUSD: ', positionSizeUSD)
    console.log('positionSizeBTC: ', positionSizeBTC)


    // Event LONG
    //      check if in trade
    //      if so log in checkAndUpdateStopLoss, return

    //      if not in trade (and no LONG signal?):
    // //      Update status in db? NO TRADE?



    // console.log(fractals, signal)
    // console.log(signalDetails)
}