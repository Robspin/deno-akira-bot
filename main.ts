import { runStrategy } from './strategies/original-cloud-fractal-strategy.ts'
import { env } from './constants.ts'


// Deno.cron("Run strategy", env.STRATEGY_CRON_SETTINGS ?? '', () => {
//     runStrategy()
// }, {
//     backoffSchedule: [1000, 5000, 10000]
// })

Deno.cron("Run once a minute", "* * * * *", () => {
    runStrategy()
});
