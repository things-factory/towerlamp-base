import net from 'net'
import PromiseSocket from 'promise-socket'
import PQueue from 'p-queue'
import { sleep } from '@things-factory/utils'

import { Connections, Connector } from '@things-factory/integration-base'

export const SOUND_GROUP = Object.freeze({
  WS: 0x00, // WS(5 Warning Sounds) *ETNB Product (built-in buzzer)
  WP: 0x01, // WP(Special 5 Warning Sounds)
  WM: 0x02, // WM(5 sounds of melody)
  WA: 0x03, // WA(5 sounds of alarm)
  WB: 0x04  // WB(Play buzzer sound)
})

export const SOUND_CASE = Object.freeze({
  // 0x00:Off, 0x01 ~ 0x05:Sound Select,

})

export const ACTION_TYPE = Object.freeze({
  WRITE: 0x57, // W
  READ: 0x52,  // R
  ACK: 0x41    // A
})

export const LAMP_ACTION = Object.freeze({
  OFF: 0x00,
  ON: 0x01,
  BLINK: 0x02
})




// 1. LAMP SEETING(PC -> LAMP)
// 2. READ STATUS(PC -> LAMP)
// 3. ACK Data(LAMP -> PC)
export class TowerlampConnector implements Connector {
  async ready(connectionConfigs) {
    await Promise.all(connectionConfigs.map(this.connect))

    Connections.logger.info('towerlamp-agv connections are ready')
  }

  static lampColor(red, yellow, green, blue, white) {
    // red, yellow, green, blue, white
    return `${red}${yellow}${green}${blue}${white}`
  }

  async connect(config: any) {
    if (Connections.getConnection(config.name)) {
      return
    }

    var [host, port] = config.endpoint.split(':')
    var socket = new PromiseSocket(new net.Socket())
    await socket.connect(port, host)

    var queue = new PQueue({ concurrency: 1 })
    var keepalive = true

    Connections.addConnection(config.name, {
      request: async function(message, { logger }) {
        return await queue.add(async () => {
          while (keepalive) {
            try {
              await socket.write(message, 'hex')
              logger && logger.info(`Request : ${message}`)

              var response = await socket.read()
              if (!response) {
                // socket ended or closed
                throw new Error('socket closed')
              }

              logger && logger.info(`Response : ${response.toString('hex')}`)
              return response
            } catch (e) {
              logger.error('agv command(write-read) failed.')
              logger.error(e)

              if (keepalive) {
                socket && socket.destroy()

                socket = new PromiseSocket(new net.Socket()) 
                await socket.connect(port, host)

                await sleep(1000)
              } else {
                throw e
              }
            }
          }
        })
      },
      close: function() {
        queue.clear()
        keepalive = false
        socket.destroy()
      },
      params: config.params
    })

    Connections.logger.info(`wellwit-agv connection(${config.name}:${config.endpoint}) is connected`)
  }

  async disconnect(name) {
    var { close } = Connections.removeConnection(name)
    close()

    Connections.logger.info(`wellwit-agv connection(${name}) is disconnected`)
  }

  get parameterSpec() {
    return []
  }

  get taskPrefixes() {
    return ['towerlamp']
  }
}

Connections.registerConnector('towerlamp-connector', new TowerlampConnector())
