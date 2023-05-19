import { ApiGatewayManagementApi } from '@aws-sdk/client-apigatewaymanagementapi'
import { paginateQuery, marshall } from '@/dynamodb'
import { logger } from '@/common'

import { REGION } from '@/env'

const apiGatewayManagementApi = new ApiGatewayManagementApi({
  region: REGION,
  endpoint: process.env.WEBSOCKETS_API_ENDPOINT.replace('wss', 'https')
})

export const main = async (event) => {
  try {
    const { Records } = event

    const messages = []

    for (const { Sns } of Records) {
      try {
        const message = JSON.parse(Sns.Message)
        messages.push(message)
      } catch (e) {
        logger.error(e)
      }
    }

    logger.info(`Processed messages (${messages.length})`)

    // Process each message
    const jobs = messages.map(async (message) => {
      try {
        const { key, payload } = message

        // Find websocket connection(s)
        const connections = await paginateQuery({
          TableName: process.env.WEBSOCKETS_TABLE_NAME,
          IndexName: 'ByKey',
          KeyConditionExpression: '#key = :key',
          ExpressionAttributeNames: {
            '#key': 'key'
          },
          ExpressionAttributeValues: marshall({
            ':key': key
          })
        })

        await Promise.all(
          connections.map((connection) =>
            apiGatewayManagementApi.postToConnection({
              ConnectionId: connection.id,
              Data: JSON.stringify(payload)
            })
          )
        )
      } catch (e) {
        logger.error(e)
      }
    })
    await Promise.all(jobs)

    return event
  } catch (e) {
    logger.error(e)
    return e
  }
}
