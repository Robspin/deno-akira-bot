export interface ApiResponse<T> {
    message: string
    data: T
    success: boolean
}

export type UpdateStrategyData = {
    active?: boolean
    inTrade?: boolean
}

export type TradePostData = {
    orderId: string
    direction: 'LONG' | 'SHORT'
    entryPrice: string
    entryAccountSize: string
    size:  string
    currentBtcPrice: string
    strategyName: string
}

export type TradeUpdateData = {
    exitPrice: string
    exitAccountSize: string
    exitedTradeAt: string
}

export type Trade = {
    orderId: string
    entryPrice: string
    entryAccountSize: string
    sizeInBTC:  string
    sizeInUSD:  string
    exitPrice?: string
    extAccountSize?: string
    strategyId?: string
    strategyName: string
    createdAt?: string
    updatedAt?: string
    exitedTradeAt?: string
    deletedAt?: string
}
