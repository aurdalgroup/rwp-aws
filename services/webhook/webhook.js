import { get } from 'lodash'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { logger, response } from '@/common'

import { REGION } from '@/env'

const snsClient = new SNSClient({ region: REGION })

export const main = async (event) => {
  try {
    const key = get(event, 'queryStringParameters.key', null)
    const query = get(event, 'queryStringParameters', null)
    const body = JSON.parse(event.body)

    logger.info(
      `Params: key = ${key}, query = ${JSON.stringify(query)}, body = ${JSON.stringify(body)}`
    )

    await snsClient.send(
      new PublishCommand({
        TopicArn: process.env.WEBSOCKETS_TOPIC_ARN,
        Message: JSON.stringify({
          key,
          payload: { query, body }
        })
      })
    )

    return response()
  } catch (e) {
    logger.error(e)
    return response()
  }
}
