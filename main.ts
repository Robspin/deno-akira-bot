import { Application, Router } from "https://deno.land/x/oak/mod.ts"

const port = 8000
const app = new Application()
const router = new Router()

router.get('/', async (ctx) => {
    ctx.response.body = 'deno akira bot running... 🏍️'
})

app.use(router.routes())
app.use(router.allowedMethods())

console.log('Running on port: ', port)
await app.listen({ port })
