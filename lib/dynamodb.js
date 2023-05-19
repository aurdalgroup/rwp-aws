import { DynamoDB, paginateQuery as _paginateQuery } from '@aws-sdk/client-dynamodb'

import { REGION } from '@/env'

import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
export { marshall, unmarshall }

export const ddb = new DynamoDB({ region: REGION })

export const paginateQuery = async (input, pageSize = 15) => {
  const config = {
    client: ddb,
    pageSize
  }
  const paginator = _paginateQuery(config, input)

  const items = []
  for await (const page of paginator) {
    items.push(...page.Items.map((item) => unmarshall(item)))
  }

  return items
}
