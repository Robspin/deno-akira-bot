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
    }
}

export abstract class BaseStrategyClass {
    abstract strategyName: string
    abstract checkStrategy(): Promise<StrategyResponse>
    abstract strategyAction(strategy: StrategyResponse): Promise<ActionReport>
    abstract management(actionReport: ActionReport): void
}