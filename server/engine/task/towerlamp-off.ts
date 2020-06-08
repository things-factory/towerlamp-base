import { Connections, TaskRegistry } from '@things-factory/integration-base'

import { ACTION_TYPE } from '../connector/towerlamp-connector'

async function towerlampOff(step, { logger }) {
  var {
    connection: connectionName
  } = step

  var connection = Connections.getConnection(connectionName)
  if (!connection) {
    throw new Error(`connection '${connectionName}' is not established.`)
  }

  var { request } = connection
  var message = Buffer.alloc(5)
  message.writeInt8(ACTION_TYPE.WRITE)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt16BE(0)
  
  var response = await request(message, { logger })

  logger.info(`towerlampOn received: ${response.toString('hex')}`)

  return {
    data: response.toString('hex')
  }
}

towerlampOff.parameterSpec = []

TaskRegistry.registerTaskHandler('towerlamp-off', towerlampOff)