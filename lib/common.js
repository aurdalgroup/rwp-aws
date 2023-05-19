import { createLogger, format, transports } from 'winston'
const { combine } = format

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(format.errors({ stack: true }), format.json()),
  defaultMeta: {},
  transports: [new transports.Console()]
})

export const response = (body, statusCode = 200, headers = {}) => ({
  statusCode,
  headers: Object.assign(
    {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json'
    },
    headers
  ),
  body: JSON.stringify(body)
})
