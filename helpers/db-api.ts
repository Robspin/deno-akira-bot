import { env } from '../constants.ts'
import { ApiResponse, Trade, TradePostData, TradeUpdateData } from '../types.ts'

const defaultResponse = {
    success: false,
    message: 'Something went wrong',
    data: undefined
}

export const dbPostTrade = async (data: TradePostData): Promise<ApiResponse<Trade | undefined>> => {
    const headers = {
        'Authorization': env.DB_API_AUTHORIZATION_KEY ?? ''
    }

    const config = {
        body: JSON.stringify(data),
        headers,
        method: 'POST'
    }

    try {
        return await (await fetch(`${env.DB_API_URL}/trades`, config)).json()
    } catch (e) {
        console.log(e)
        return defaultResponse
    }
}

export const dbGetTrade = async (id: string): Promise<ApiResponse<Trade | undefined>> => {
    const headers = {
        'Authorization': env.DB_API_AUTHORIZATION_KEY ?? ''
    }

    try {
        return await (await fetch(`${env.DB_API_URL}/trades/orders/${id}`, { headers })).json()
    } catch (e) {
        console.log(e)
        return defaultResponse
    }
}

export const dbGetStrategyTrades = async (strategyName: string): Promise<ApiResponse<Trade[]>> => {
    const headers = {
        'Authorization': env.DB_API_AUTHORIZATION_KEY ?? ''
    }

    try {
        return await (await fetch(`${env.DB_API_URL}/strategies/${strategyName}/trades`, { headers })).json()
    } catch (e) {
        console.log(e)
        return {
            success: false,
            message: 'Something went wrong',
            data: []
        }
    }
}

export const dbUpdateTrade = async (id: string, data: TradeUpdateData): Promise<ApiResponse<Trade | undefined>> => {
    const headers = {
        'Authorization': env.DB_API_AUTHORIZATION_KEY ?? ''
    }

    const config = {
        body: JSON.stringify(data),
        headers,
        method: 'PUT'
    }
    try {
        return await (await fetch(`${env.DB_API_URL}/trades/orders/${id}`, config)).json()
    } catch (e) {
        console.log(e)
        return defaultResponse
    }
}
