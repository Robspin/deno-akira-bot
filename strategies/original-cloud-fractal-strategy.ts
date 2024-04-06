import { env } from '../constants.ts'
import { williamsFractals } from '../indicators/fractals.ts'
import { ichimoku, Signal } from '../indicators/ichimoku.ts'
import { sendEvent as apiSendEvent } from '../helpers/event-api.ts'
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

const sendEvent = async (message: string) => {
    try {
        await apiSendEvent(message)
    } catch (e) {
        console.log(e)
    }
}

export const runStrategy = async () => {
    const { fractals, signal, signalDetails } = await getStrategyInfo()


    const bfxClient = new BitfinexBaseClient(env.BITFINEX_API_KEY ?? '', env.BITFINEX_API_SECRET ?? '')
    const tradingClient = new BitfinexTradingClass(bfxClient)

    const stopLossRes = await tradingClient.checkAndUpdateLongStopLoss(fractals)

    await sendEvent(`${signal}. ${stopLossRes.message}. ${signalDetails}`)

    if (signal !== 'LONG') return
    const openTrades = await tradingClient.hasOpenTrades()
    if (openTrades) return

    const accountBalance = await tradingClient.getAccountBalance()
    // const positionSizeUSD = tradingClient.getPositionSizeInDollars(accountBalance)
    const positionSizeBTC = String(await tradingClient.getPositionSizeInBTC(accountBalance))
    const negativePositionSizeBTC = String(Number(positionSizeBTC) * -1)

    const openLong = await tradingClient.openLong(String(positionSizeBTC))
    const setStopLoss = await tradingClient.openStopLoss(negativePositionSizeBTC, String(fractals.downFractals[0]))

    await sendEvent(`Entered long trade! Opened long: ${openLong.success}, has set a stop ${setStopLoss.success}`)

    // Event LONG
    //      check if in trade
    //      if so log in checkAndUpdateStopLoss, return

    //      if not in trade (and no LONG signal?):
    // //      Update status in db? NO TRADE?

    // console.log(fractals, signal)
    // console.log(signalDetails)
}