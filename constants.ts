import { load } from "https://deno.land/std@0.181.0/dotenv/mod.ts"

const localEnv = await load({ allowEmptyValues: true })

export const env = {
    STRATEGY_FRACTAL_TIMEFRAME: localEnv.STRATEGY_FRACTAL_TIMEFRAME || Deno.env.get('STRATEGY_FRACTAL_TIMEFRAME'),
    STRATEGY_ICHIMOKU_TIMEFRAME: localEnv.STRATEGY_ICHIMOKU_TIMEFRAME || Deno.env.get('STRATEGY_ICHIMOKU_TIMEFRAME'),
    DENO_EVENT_API_URL: localEnv.DENO_EVENT_API_URL || Deno.env.get('DENO_EVENT_API_URL'),
    DENO_EVENT_API_TOKEN: localEnv.DENO_EVENT_API_TOKEN || Deno.env.get('DENO_EVENT_API_TOKEN'),
}
