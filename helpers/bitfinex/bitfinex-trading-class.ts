import { BaseResponse, BaseTradingClass } from '../base-trading-class.ts'
import { BitfinexClientInstance } from './bitfinex-base-client.ts'


export class BitfinexTradingClass extends BaseTradingClass {
    private readonly bfxClient: BitfinexClientInstance

    constructor(bitfinexClient: BitfinexClientInstance) {
        super()
        this.bfxClient = bitfinexClient
    }

    async getAccountBalance(): Promise<number> {
        try {
            const marginBase = await this.bfxClient.bitfinexApiPost('v2/auth/r/info/margin/base')
            console.log(marginBase)

            return marginBase[1][2].toFixed(2)
        } catch (e) {
            console.log(e)
            return 0
        }
    }

    async getMarginWalletBTC(): Promise<string> {
        try {
            const wallet = await this.bfxClient.bitfinexApiPost('v2/auth/r/wallets')
            const ballanceInBTC = wallet.find((w: any) => w[0] === 'margin' && w[1] === 'BTC')[2]

            return String(ballanceInBTC)
        } catch (e) {
            console.log(e)
            return '0'
        }
    }

    async getBTCPrice(): Promise<string> {
        try {
            const tickerResponse = await (await fetch('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD')).json()
            return String(tickerResponse[0][1])
        } catch (e) {
            console.log(e)
            return '0'
        }
    }

    async getPositionSizeInBTC(accountBalance: number): Promise<number> {
        try {
            const sizeInDollars = this.getPositionSizeInDollars(accountBalance)
            const tickerResponse = await (await fetch('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD')).json()
            const currentPrice = tickerResponse[0][1]
            return Number((Number(sizeInDollars) / currentPrice).toFixed(5))
        } catch (e) {
            console.log(e)
            return 0
        }
    }

    async hasOpenTrades(): Promise<boolean> {
        try {
            const positions: any[] = await this.bfxClient.bitfinexApiPost('v2/auth/r/positions')

            return positions.length > 0
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getOrderById(id: string): Promise<boolean> {
        try {
            const positions: any[] = await this.bfxClient.bitfinexApiPost(`v2/auth/r/order/tBTCUSD:${id}/trades`)
            console.log(positions)
            return positions.length > 0
        } catch (e) {
            console.log(e)
            return false
        }
    }
    async getLastStopPrice(): Promise<string> {
        try {
            const trades: any[] = await this.bfxClient.bitfinexApiPost(`v2/auth/r/trades/hist`)
            const stopExecutionPrice = trades.find((p: any) => p[6] === 'STOP')[5]
            return String(stopExecutionPrice)
        } catch (e) {
            console.log(e)
            return '0'
        }
    }

    async cancelOrder(id: number): Promise<BaseResponse> {
        try {
            const body = { id }
            const res = await this.bfxClient.bitfinexApiPost('v2/auth/w/order/cancel', body)
            return { success: res[6] === 'SUCCESS', message: res[7] }
        } catch (e) {
            console.log(e)
            return { success: false, message: e }
        }
    }

    async openLong(amount: string): Promise<BaseResponse> {
        try {
            const body = {
                type: 'MARKET',
                symbol: 'tBTCUSD',
                amount
            }

            const res = await this.bfxClient.bitfinexApiPost('v2/auth/w/order/submit', body)

            return { success: res[6] === 'SUCCESS', message: String(res[7]), data: res }
        } catch (e) {
            console.log(e)
            return { success: false, message: e }
        }
    }

    async openStopLoss(amount: string, price: string): Promise<BaseResponse> {
        try {
            const body = {
                type: 'STOP',
                symbol: 'tBTCUSD',
                price,
                amount
            }

            const res = await this.bfxClient.bitfinexApiPost('v2/auth/w/order/submit', body)
            return { success: res[6] === 'SUCCESS', message: res[7] }
        } catch (e) {
            console.log(e)
            return { success: false, message: e }
        }
    }

    async checkAndUpdateLongStopLoss(fractals: any): Promise<BaseResponse>{
        const fractal = String(fractals.downFractals[0])

        try {
            const positions: any[] = await this.bfxClient.bitfinexApiPost('v2/auth/r/positions')
            const orders: any[] = await this.bfxClient.bitfinexApiPost('v2/auth/r/orders')

            console.log('positions: ', positions)
            console.log('orders: ', orders)

            if (positions.length === 0) return { success: false, message: '' }

            if (positions.length !== 0 && orders.length === 0) {
                const amount = positions[0][2] * -1
                const stopRes = await this.openStopLoss(String(amount), String(fractal))

                if (stopRes.success) return { success: true, message: 'There was no stop! Stop set!' }
                return { success: false, message: 'There was no stop! Failed to set stop!' }
            }

            const [id, _1, _2, _pair, _4, _5, amount, _7, _type, _9, _10, _11, _12, _13, _14, _15, price] = orders[0]

            const newStop = String(price) !== fractal
            if (!newStop) return { success: false, message: 'Checked but no new stop set.' }
            const resCancel = await this.cancelOrder(id)
            if (!resCancel.success) return { success: false, message: resCancel.message }
            const resUpdateStopLoss = await this.openStopLoss(String(amount), String(fractal))

            const result = resCancel.success && resUpdateStopLoss.success

            return { success: result, message: result ? 'Updated stoploss!' : 'Something went wrong updating stoploss.' }
        } catch (e) {
            console.log(e)
            return { success: false, message: e }
        }
    }
}