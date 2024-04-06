import { runStrategy } from './strategies/original-cloud-fractal-strategy.ts'
import { env } from './constants.ts'


Deno.cron("Run strategy", env.STRATEGY_CRON_SETTINGS ?? '', async () => {
    await runStrategy()
}, {
    backoffSchedule: [1000, 5000, 10000]
})
