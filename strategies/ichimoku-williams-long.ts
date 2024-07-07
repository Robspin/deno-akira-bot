import { ActionReport, BaseStrategyClass, StrategyResponse } from '../helpers/base-strategy-class.ts'
import { williamsFractals } from '../indicators/fractals.ts'
import { env } from '../constants.ts'
import { ichimoku } from '../indicators/ichimoku.ts'
import { BitfinexBaseClient } from '../helpers/bitfinex/bitfinex-base-client.ts'
import { BitfinexTradingClass } from '../helpers/bitfinex/bitfinex-trading-class.ts'
import { dbGetStrategyTrades, dbPostTrade, dbUpdateTrade } from '../helpers/db-api.ts'
import { TradeUpdateData } from '../types.ts'
import { sendEvent } from '../helpers/event-api.ts'


class IchimokuWilliamsLong extends BaseStrategyClass {
    public strategyName = 'ICHIMOKU_WILLIAMS_LONG'
    public tradingClient: BitfinexTradingClass

    constructor() {
        super()
        const bfxClient = new BitfinexBaseClient(env.BITFINEX_API_KEY ?? '', env.BITFINEX_API_SECRET ?? '')
        this.tradingClient = new BitfinexTradingClass(bfxClient)
    }

    checkStrategy = async (): Promise<StrategyResponse> => {
        console.log('checking strategy...')
        const fractals = await williamsFractals(env.STRATEGY_FRACTAL_TIMEFRAME ?? '')
        const { signal: ichimokuSignal, signalDetails } = await ichimoku(env.STRATEGY_ICHIMOKU_TIMEFRAME ?? '')

        sendEvent(`${ichimokuSignal} - ${signalDetails}`)

        return  {
            signal: ichimokuSignal === 'LONG' ? 'LONG' : 'NO_SIGNAL',
            stop: String(fractals.downFractals[0])
        }
    }

    strategyAction = async ({ signal, stop }: StrategyResponse): Promise<ActionReport> => {
        console.log('strategy signal: ', signal)
        const actionReport: ActionReport = {
            trade: undefined,
            openPosition: false,
            accountSize: '0'
        }

        const openTrades = await this.tradingClient.hasOpenTrades()
        const accountBalanceInBTC = await this.tradingClient.getMarginWalletBTC()

        actionReport.openPosition = openTrades
        actionReport.accountSize = accountBalanceInBTC

        if (openTrades || signal !== 'LONG') return actionReport

        const accountBalance = await this.tradingClient.getAccountBalance()
        const currentBTCPrice = await this.tradingClient.getBTCPrice()
        const positionSizeBTC = String(await this.tradingClient.getPositionSizeInBTC(accountBalance))
        const negativePositionSizeBTC = String(Number(positionSizeBTC) * -1)

        const openLong = await this.tradingClient.openLong(String(positionSizeBTC))
        const setStopLoss = await this.tradingClient.openStopLoss(negativePositionSizeBTC, stop)

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
                strategyName: this.strategyName
            }
        }

        return actionReport
    }

    management = async (actionReport: ActionReport): Promise<void> => {
        console.log('starting management...')
        console.log(actionReport)
        if (actionReport.trade) {
            const { success } = await dbPostTrade(actionReport.trade)
            console.log('sucessfully inserted trade in db :', success)
            await sendEvent('Entered long trade!', true)
        } else if (!actionReport.openPosition) {
            const { data: historicalTrades } = await dbGetStrategyTrades(this.strategyName)
            const { orderId, exitPrice } = await historicalTrades[0]
            if (!exitPrice) {
                const lastStopPrice = await this.tradingClient.getLastStopPrice()
                const updateData: TradeUpdateData = {
                    exitPrice: lastStopPrice,
                    exitAccountSize: actionReport.accountSize,
                    exitedTradeAt: String(new Date())
                }

                const dbUpdateRes = await dbUpdateTrade(orderId, updateData)

                console.log('successfully updated past trade in db: ', dbUpdateRes.success)
                await sendEvent('Updated past trade data!', true)
            }
        }
    }
}

export default async function runStrategy() {
    const { checkStrategy, strategyAction, management } = new IchimokuWilliamsLong()

    const strategy = await checkStrategy()
    const actionReport = await strategyAction(strategy)
    await management(actionReport)
}