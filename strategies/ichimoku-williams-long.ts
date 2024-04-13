import { ActionReport, BaseStrategyClass, StrategyResponse } from '../helpers/base-strategy-class.ts'
import { williamsFractals } from '../indicators/fractals.ts'
import { env } from '../constants.ts'
import { ichimoku } from '../indicators/ichimoku.ts'
import { BitfinexBaseClient } from '../helpers/bitfinex/bitfinex-base-client.ts'
import { BitfinexTradingClass } from '../helpers/bitfinex/bitfinex-trading-class.ts'
import { dbPostTrade } from '../helpers/db-api.ts'


class IchimokuWilliamsLong extends BaseStrategyClass {
    strategyName = 'ICHIMOKU_WILLIAMS_LONG'

    async checkStrategy(): Promise<StrategyResponse> {
        console.log('checking strategy...')
        const fractals = await williamsFractals(env.STRATEGY_FRACTAL_TIMEFRAME ?? '')
        const { signal: ichimokuSignal } = await ichimoku(env.STRATEGY_ICHIMOKU_TIMEFRAME ?? '')

        return  {
            signal: ichimokuSignal === 'LONG' ? 'LONG' : 'NO_SIGNAL',
            stop: String(fractals.downFractals[0])
        }
    }

    async strategyAction({ signal, stop }: StrategyResponse): Promise<ActionReport> {
        console.log('strategy signal: ', signal)
        const actionReport: ActionReport = {
            trade: undefined
        }

        const bfxClient = new BitfinexBaseClient(env.BITFINEX_API_KEY ?? '', env.BITFINEX_API_SECRET ?? '')
        const tradingClient = new BitfinexTradingClass(bfxClient)
        const openTrades = await tradingClient.hasOpenTrades()

        if (openTrades || signal !== 'LONG') return actionReport

        const accountBalance = await tradingClient.getAccountBalance()
        const accountBalanceInBTC = await tradingClient.getMarginWalletBTC()
        const currentBTCPrice = await tradingClient.getBTCPrice()
        const positionSizeBTC = String(await tradingClient.getPositionSizeInBTC(accountBalance))
        const negativePositionSizeBTC = String(Number(positionSizeBTC) * -1)

        const openLong = await tradingClient.openLong(String(positionSizeBTC))
        const setStopLoss = await tradingClient.openStopLoss(negativePositionSizeBTC, stop)

        const orderFillPrice = String(openLong.data[4][0][16])
        const orderId = String(openLong.data[4][0][0])
        console.log('opened long: ', openLong.success)
        console.log('set stop: ', setStopLoss.success)

        if (openLong.success) {
            actionReport.trade = {
                direction: 'LONG',
                orderId: orderId,
                currentBtcPrice: currentBTCPrice,
                entryPrice: orderFillPrice,
                entryAccountSize: accountBalanceInBTC,
                size: positionSizeBTC,
                strategyName: 'ICHIMOKU_WILLIAMS_LONG'
            }
        }

        return actionReport
    }

    async management(actionReport: ActionReport): Promise<void> {
        console.log('action report: ', actionReport)

        if (actionReport.trade) {
            const { success } = await dbPostTrade(actionReport.trade)
            console.log('sucessfully inserted trade in db :', success)
        }
    }
}

export default async function runStrategy() {
    const { checkStrategy, strategyAction, management } = new IchimokuWilliamsLong()

    const strategy = await checkStrategy()
    const actionReport = await strategyAction(strategy)
    await management(actionReport)
}