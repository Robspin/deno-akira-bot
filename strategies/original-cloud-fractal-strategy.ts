import { env } from '../constants.ts'
import { williamsFractals } from '../indicators/fractals.ts'
import { ichimoku } from '../indicators/ichimoku.ts'
import { sendEvent } from '../helpers/event-api.ts'

export const getStrategyInfo = async () => {
    const fractals = await williamsFractals(env.STRATEGY_FRACTAL_TIMEFRAME ?? '')
    const ichimokuSignal = await ichimoku(env.STRATEGY_ICHIMOKU_TIMEFRAME ?? '')
    const { signal, signalDetails } = ichimokuSignal

    return { fractals, signal, signalDetails }
}

export const runStrategy = async () => {
    const { fractals, signal, signalDetails } = await getStrategyInfo()

    try {
        await sendEvent(`${signal}. ${signalDetails}`)
    } catch (e) {
        console.log(e)
    }

    console.log(fractals, signal)
    console.log(signalDetails)
}