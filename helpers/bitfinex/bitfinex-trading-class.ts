import { BaseTradingClass } from '../base-trading-class.ts'
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

    async openLong(): Promise<any> {
        // Implementation for opening a long position
        return console.log('Opening a long position.');
    }

    // // Optionally override the closeAllTrades method
    // override closeAllTrades(): void {
    //     console.log('Specific logic for closing all Bitcoin trades.');
    // }
}