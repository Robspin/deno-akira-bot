import { env } from '../constants.ts'


type updateData = {
    active?: boolean
    inTrade?: boolean
}

export const dbUpdateStrategy = async (strategy: string, data: updateData) => {
    const headers = {
        'Authorization': env.DB_API_AUTHORIZATION_KEY ?? ''
    }

    const config = {
        body: JSON.stringify(data),
        headers,
        method: 'PUT'
    }

    return await (await fetch(`${env.DB_API_URL}/strategies/${strategy}`, config)).json()
}