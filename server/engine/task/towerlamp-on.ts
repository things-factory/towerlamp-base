import { Connections, TaskRegistry } from '@things-factory/integration-base'

import { ACTION_TYPE } from '../connector/towerlamp-connector'

async function towerlampOn(step, { logger }) {
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
  message.writeInt8(ACTION_TYPE.WRITE)
  message.writeInt8(soundGroup)
  message.writeInt8(red)
  message.writeInt8(yellow)
  message.writeInt8(green)
  message.writeInt8(blue)
  message.writeInt8(white)
  message.writeInt8(sound)
  message.writeInt16BE(0)
  
  var response = await request(message, { logger })

  logger.info(`towerlampOn received: ${response.toString('hex')}`)

  return {
    data: response.toString('hex')
  }
}

towerlampOn.parameterSpec = [
  {
    type: 'select',
    name: 'soundGroup',
    label: 'Sound Group',
    property: {
      options: [
        { display: ' ', value: ' ' },
        { display: 'WS: 5 Warning Sounds', value: 0x00 }, // y좌표가 증가하는 방향, 기준이되는 방향임,
        { display: 'WP: Special 5 Warning Sounds', value: 0x01 }, // x좌표가 증가하는 방향
        { display: 'WM: 5 sounds of melody', value: 0x02 }, // x좌표가 작아지는 방향
        { display: 'WA: 5 sounds of alarm', value: 0x03 }, // y좌표가 작아지는 방향
        { display: 'WB: Play buzzer sound', value: 0x04 } // y좌표가 작아지는 방향
      ]
    }
  },
  {
    type: 'select',
    name: 'sound',
    label: 'Sound',
    property: {
      options: [
        { display: '0', value: 0x00 },
        { display: '1', value: 0x01 },
        { display: '2', value: 0x02 }
        { display: '3', value: 0x03 }
        { display: '4', value: 0x04 }
        { display: '5', value: 0x05 }
      ]
    }
  },
  {
    type: 'select',
    name: 'red',
    label: 'Red Lamp',
    property: {
      options: [
        { display: 'off', value: 0x00 },
        { display: 'on', value: 0x01 },
        { display: 'blink', value: 0x02 }
      ]
    }
  },
  {
    type: 'select',
    name: 'yellow',
    label: 'Yellow Lamp',
    property: {
      options: [
        { display: 'off', value: 0x00 },
        { display: 'on', value: 0x01 },
        { display: 'blink', value: 0x02 }
      ]
    }
  },
  {
    type: 'select',
    name: 'green',
    label: 'Green Lamp',
    property: {
      options: [
        { display: 'off', value: 0x00 },
        { display: 'on', value: 0x01 },
        { display: 'blink', value: 0x02 }
      ]
    }
  },
  {
    type: 'select',
    name: 'blue',
    label: 'Blue Lamp',
    property: {
      options: [
        { display: 'off', value: 0x00 },
        { display: 'on', value: 0x01 },
        { display: 'blink', value: 0x02 }
      ]
    }
  },
  {
    type: 'select',
    name: 'white',
    label: 'White Lamp',
    property: {
      options: [
        { display: 'off', value: 0x00 },
        { display: 'on', value: 0x01 },
        { display: 'blink', value: 0x02 }
      ]
    }
  }
]

TaskRegistry.registerTaskHandler('towerlamp-on', towerlampOn)