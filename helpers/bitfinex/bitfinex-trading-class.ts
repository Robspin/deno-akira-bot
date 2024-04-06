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
            return marginBase[1][2].toFixed(2)
        } catch (e) {
            console.log(e)
            return 0
        }
    }

    async getPositionSizeInBTC(accountBalance: number): Promise<number> {
        try {
            const sizeInDollars = this.getPositionSizeInDollars(accountBalance)
            const tickerResponse = await (await fetch('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD')).json()
            const currentPrice = tickerResponse[0][1]
            return Number((sizeInDollars / currentPrice).toFixed(5))
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
            return { success: res[6] === 'SUCCESS', message: String(res[7]) }
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
            const orders: any[] = await this.bfxClient.bitfinexApiPost('v2/auth/r/orders')

            if (!orders) return { success: true, message: 'Found no orders while trying to update stoploss' }

            const [id, _1, _2, _pair, _4, _5, amount, _7, _type, _9, _10, _11, _12, _13, _14, _15, price] = orders[0]

            const newStop = price !== fractal
            if (!newStop) return { success: false, message: 'Checked but no new stop set' }
            const resCancel = await this.cancelOrder(id)
            if (!resCancel.success) return { success: false, message: resCancel.message }
            const resUpdateStopLoss = await this.openStopLoss(String(amount), String(fractal))

            const result = resCancel.success && resUpdateStopLoss.success

            return { success: result, message: result ? 'Updated stoploss!' : 'Something went wrong updating stoploss' }
        } catch (e) {
            console.log(e)
            return { success: false, message: e }
        }
    }
    // // Optionally override the closeAllTrades method
    // override closeAllTrades(): void {
    //     console.log('Specific logic for closing all Bitcoin trades.');
    // }
}