import { ddb, marshall } from '@/dynamodb'
import { logger } from '@/common'

export const auth = async (event) => {
  try {
    const { key } = event.queryStringParameters

    // Return IAM policy
    return {
      principalId: 'authorized',
      context: {
        key
      },
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      }
    }
  } catch (e) {
    logger.error(e)
    return 'Authentication failed.'
  }
}

export const route = async (event) => {
  const { routeKey, connectionId, authorizer } = event.requestContext
  const { key } = authorizer

  if (routeKey === '$connect')
    await ddb.putItem({
      TableName: process.env.WEBSOCKETS_TABLE_NAME,
      Item: marshall({
        id: connectionId,
        key,
        // Expire the connection an hour later.
        ttl: parseInt(Date.now() / 1000 + 3600)
      })
    })

  if (routeKey === '$disconnect')
    await ddb.deleteItem({
      TableName: process.env.WEBSOCKETS_TABLE_NAME,
      Key: marshall({ id: connectionId })
    })

  return { statusCode: 200 }
}
