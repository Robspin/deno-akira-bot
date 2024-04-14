import { env } from '../constants.ts'


export const sendEvent = async (message: string) => {
    const body = JSON.stringify({
        source: env.EVENT_API_SOURCE ?? '',
        message
    })

    const headers = {
        'Authorization': env.EVENT_API_TOKEN ?? ''
    }

    const config = {
        body,
        headers,
        method: 'POST'
    }

    try {
        return await fetch(`${env.EVENT_API_URL}/events`, config)
    } catch (e) {
        console.log(e)
    }
}