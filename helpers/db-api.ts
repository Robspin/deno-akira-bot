import { env } from '../constants.ts'
import { Trade, TradePostData, UpdateStrategyData } from '../types.ts'

export const dbUpdateStrategy = async (strategy: string, data: UpdateStrategyData) => {
    const headers = {
        'Authorization': env.DB_API_AUTHORIZATION_KEY ?? ''
    }

    const config = {
        body: JSON.stringify(data),
        headers,
        method: 'PUT'
    }

    return await (await fetch(`${env.DB_API_URL}/strategies/${strategy}`, config)).json()
}

export const dbPostTrade = async (data: TradePostData) => {
    const headers = {
        'Authorization': env.DB_API_AUTHORIZATION_KEY ?? ''
    }

    const config = {
        body: JSON.stringify(data),
        headers,
        method: 'POST'
    }

    return await (await fetch(`${env.DB_API_URL}/trades`, config)).json()
}
