import { load } from "https://deno.land/std@0.181.0/dotenv/mod.ts"

const localEnv = await load({ allowEmptyValues: true })

export const env = {
    STRATEGY_FRACTAL_TIMEFRAME: localEnv.STRATEGY_FRACTAL_TIMEFRAME || Deno.env.get('STRATEGY_FRACTAL_TIMEFRAME'),
    STRATEGY_ICHIMOKU_TIMEFRAME: localEnv.STRATEGY_ICHIMOKU_TIMEFRAME || Deno.env.get('STRATEGY_ICHIMOKU_TIMEFRAME'),
    STRATEGY_CRON_SETTINGS: localEnv.STRATEGY_CRON_SETTINGS || Deno.env.get('STRATEGY_CRON_SETTINGS'),
    STRATEGY_RISK_PERCENTAGE: localEnv.STRATEGY_RISK_PERCENTAGE || Deno.env.get('STRATEGY_RISK_PERCENTAGE'),

    BITFINEX_API_KEY: localEnv.BITFINEX_API_KEY || Deno.env.get('BITFINEX_API_KEY'),
    BITFINEX_API_SECRET: localEnv.BITFINEX_API_SECRET || Deno.env.get('BITFINEX_API_SECRET'),

    EVENT_API_URL: localEnv.EVENT_API_URL || Deno.env.get('EVENT_API_URL'),
    EVENT_API_TOKEN: localEnv.EVENT_API_TOKEN || Deno.env.get('EVENT_API_TOKEN'),
    EVENT_API_SOURCE: localEnv.EVENT_API_SOURCE || Deno.env.get('EVENT_API_SOURCE'),
}
