import { env } from './constants.ts'
import runStrategy from './strategies/ichimoku-williams-long.ts'

await runStrategy()
// Deno.cron("Run strategy", env.STRATEGY_CRON_SETTINGS ?? '', async () => {
//     await runStrategy()
// })
