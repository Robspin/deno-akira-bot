import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts"
import { config as env } from "https://deno.land/std@0.158.0/dotenv/mod.ts"
export const VARIABLES = await env()

type Fractals = {
    downFractals: number[], upFractals: number[]
}

export class FtxClient {
    private readonly apiSecret: string
    config: any

    constructor(apiKey: string, apiSecret: string, subAccount: string) {
        this.config = {
            baseUrl: 'https://ftx.com/api',
            timeout: 5000,
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json; utf-8',
                'FTX-KEY': apiKey,
                'FTX-SUBACCOUNT': subAccount
            }
        }
        this.apiSecret = apiSecret
    }

    private makeSignature(method: string, url: string, params?: object) {
        const now = Date.now()
        this.config.headers['FTX-TS'] = now
        let dataQueryString = now + method + '/api' + url
        if (params) dataQueryString += JSON.stringify(params)

        this.config.headers['FTX-SIGN'] = hmac('sha256', this.apiSecret, dataQueryString, 'utf8', 'hex')
    }

    async apiRequest(method: string, url: string, params?: object) {
        this.makeSignature(method, url, params)
        const body = JSON.stringify(params)

        const res = await fetch(`${this.config.baseUrl}${url}`, { method: method, headers: this.config.headers, body })

        return await res.json()
    }

    async hasOpenPosition() {
        const data = await this.apiRequest('GET', '/positions')
        if (data.result.length === 0) return false
        if (data.result[0].size === 0) return false
        return true
    }

    async hasOpenTriggerOrders() {
        const data = await this.apiRequest('GET', '/conditional_orders?market=BTC-PERP')
        if (data.result.length === 0) return false
        return true
    }

    async getAccountBalance() : Promise<number> {
        const res = await this.apiRequest('GET', '/account')
        return res.result.totalAccountValue.toFixed(2)
    }

    async openPosition(side: 'buy' | 'sell', size: number) {
        const currentFuture = await this.apiRequest('GET', '/futures/BTC-PERP')
        const convertedSize = size / currentFuture.result.last

        const data = {
            'market': 'BTC-PERP',
            'type': 'market',
            'price': null,
            'reduceOnly': false,
            size: convertedSize,
            side
        }

        const res = await this.apiRequest('POST', '/orders', data)
        if (res.success) await this.enterTradeInDB(res).then(() => console.log(`        entered trade into DB`)).catch(e => console.log(e))

        return res
    }

    async enterTradeInDB(res: any) {
        const walletValue = await this.getAccountBalance()
        const futureRes = await this.apiRequest('GET', '/futures/BTC-PERP')
        const price = futureRes.result.last
        const { market, size, side, id } = res.result

        const body = JSON.stringify({
            strategy: 'ichimoku-fractal',
            timeframe: VARIABLES.STRATEGY_FRACTAL_TIMEFRAME,
            walletValueUSD: Number(walletValue),
            walletValueBTC: Number((walletValue / price).toFixed(7)),
            tradeId: String(id),
            market,
            price,
            size,
            side,
        })

        const headers = { 'content-type': 'application/json' }
        return await fetch(`${VARIABLES.AKIRA_BACKEND_URL}/api/trades`, { method: 'POST', headers, body })
    }

    async placeStopLoss(fractals: Fractals) {
        const res = await this.apiRequest('GET', '/positions')
        const { size, side, id } = res.result[0]
        let price
        if (side === 'buy') price = fractals.downFractals[0]
        if (side === 'sell') price = fractals.upFractals[0]
        const data = {
            'market': 'BTC-PERP',
            'triggerPrice': price,
            'reduceOnly': true,
            'type': 'stop',
            side: side === 'buy' ? 'sell' : 'buy',
            size,
        }
        const stopRes = await this.apiRequest('POST', '/conditional_orders', data)
        if (stopRes.success) {
            console.log(`       Created ${side} stop @${price}`)
        } else {
            console.log(`       Failed to place stoploss`)
        }
        await this.updateTradeInDB(price)

        return stopRes
    }

    async updateTradeInDB(stoppedOutAt: number | undefined ) {
        const res = await this.apiRequest('GET', '/orders/history')
        const tradeId = res.result[0].id

        const body = JSON.stringify({ tradeId: String(tradeId), stoppedOutAt: String(stoppedOutAt) })

        const headers = { 'content-type': 'application/json' }
        return await fetch(`${VARIABLES.AKIRA_BACKEND_URL}/api/trades`, { method: 'PUT', headers, body })
            .then(e => console.log(`        tradeStop updated`))
            .catch(e => console.log(e))
    }

    async cancelAllOrders() {
        return await this.apiRequest('DELETE', '/orders', { 'market': 'BTC-PERP' })
    }

    async convertDollarsIntoBitcoin() {
        console.log(await this.apiRequest('GET', '/account'))
    }

    async checkAndMoveStopLoss(fractals: Fractals) {
        const currentStopLoss = await this.apiRequest('GET', '/conditional_orders?market=BTC-PERP')
        if (currentStopLoss.result.length === 0) {
            await this.placeStopLoss(fractals)
            return
        }

        const { side, triggerPrice } = currentStopLoss.result[0]
        const { downFractals, upFractals } = fractals

        if (side === 'buy' && triggerPrice !== downFractals[0] || side === 'sell' && triggerPrice !== upFractals[0]) {
            await this.cancelAllOrders()
            console.log(`
            Canceled existing stops`)
            await this.placeStopLoss(fractals)
        }
    }
}
