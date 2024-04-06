import { env } from '../constants.ts'

export type BaseResponse = {
    success: boolean,
    message: string
    data?: any
}

export abstract class BaseTradingClass {
    abstract getAccountBalance(): Promise<number>
    abstract getPositionSizeInBTC(accountBalance: number): Promise<number>
    abstract hasOpenTrades(): Promise<boolean>
    abstract openLong(amount: string): Promise<BaseResponse>
    abstract openStopLoss(price: string, amount: string): Promise<BaseResponse>

    getPositionSizeInDollars(accountBalance: number): number {
        const risk = this.getRisk()
        return Number((risk * accountBalance).toFixed(2))
    }

    private getRisk() {
        return Number(env.STRATEGY_RISK_PERCENTAGE) / 100
    }
}

export type BaseTradingClassInstance = InstanceType<typeof BaseTradingClass>
