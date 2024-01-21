// import { Application, Router } from "https://deno.land/x/oak/mod.ts"
//
// const port = 8000
// const app = new Application()
// const router = new Router()
//
// router.get('/', async (ctx) => {
//     ctx.response.body = 'deno akira bot running... 🏍️'
// })
//
// app.use(router.routes())
// app.use(router.allowedMethods())
//
// console.log('Running on port: ', port)
// await app.listen({ port })

import { runStrategy } from './strategies/original-cloud-fractal-strategy.ts'

Deno.cron("Run strategy", "00 * * * *", async () => {
    await runStrategy()
}, {
    backoffSchedule: [1000, 5000, 10000],
});
