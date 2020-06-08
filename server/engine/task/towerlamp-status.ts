import { Connections, TaskRegistry } from '@things-factory/integration-base'

import { ACTION_TYPE } from '../connector/towerlamp-connector'

async function towerlampStatus(step, { logger }) {
  var {
    connection: connectionName,
    params: { soundGroup, sound, red, yellow, green, blue, white }
  } = step

  var connection = Connections.getConnection(connectionName)
  if (!connection) {
    throw new Error(`connection '${connectionName}' is not established.`)
  }

  var { request } = connection
  var message = Buffer.alloc(5)
  message.writeInt8(ACTION_TYPE.READ)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt8(0)
  message.writeInt16LE(0)
  
  var response = await request(message, { logger })

  logger.info(`towerlampStatus received: ${response.toString('hex')}`)

  var soundGroup = response.readInt8(0)
  var redLamp = response.readInt8(0)
  var yellowLamp = response.readInt8(0)
  var greenLamp = response.readInt8(0)
  var blueLamp = response.readInt8(0)
  var whiteLamp = response.readInt8(0)
  var soundCh = response.readInt8(0)

  var data = { soundGroup, redLamp, yellowLamp, greenLamp, blueLamp, whiteLamp, soundCh }

  return { data }
}

towerlampStatus.parameterSpec = []

TaskRegistry.registerTaskHandler('towerlamp-status', towerlampStatus)