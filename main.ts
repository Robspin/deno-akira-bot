import { runStrategy } from './strategies/original-cloud-fractal-strategy.ts'
import { env } from './constants.ts'

await runStrategy()

// Deno.cron("Run strategy", env.STRATEGY_CRON_SETTINGS ?? '', async () => {
// }, {
//     backoffSchedule: [1000, 5000, 10000]
// })
