export type StrategyResponse = {
    signal: 'LONG' | 'NO_SIGNAL'
    stop: string
}

export type ActionReport = {
    trade?: {
        direction: 'LONG' | 'SHORT'
        orderId: string
        currentBtcPrice: string
        entryPrice: string
        entryAccountSize: string
        size: string
        strategyName: string
    },
    openPosition: boolean
    accountSize: string
}

export abstract class BaseStrategyClass {
    abstract checkStrategy(): Promise<StrategyResponse>
    abstract strategyAction(strategy: StrategyResponse): Promise<ActionReport>
    abstract management(actionReport: ActionReport): void
}