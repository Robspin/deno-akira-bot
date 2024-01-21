import { runStrategy } from './strategies/original-cloud-fractal-strategy.ts'
import { env } from './constants.ts'



// await runStrategy()

Deno.cron("Run strategy", env.STRATEGY_CRON_SETTINGS ?? '', async () => {
    // await runStrategy()
    console.log('Disabled for now')


}, {
    backoffSchedule: [1000, 5000, 10000],
});
