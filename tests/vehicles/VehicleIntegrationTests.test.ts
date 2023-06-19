import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'

import { spawnVehicleReceptor } from '@etherealengine/engine/src/vehicle/functions/spawnVehicleReceptor'
import { destroyEngine, Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '@etherealengine/engine/src/networking/functions/WorldNetworkActionReceptor'
import { Physics } from '@etherealengine/engine/src/physics/classes/Physics'
import { createMockNetwork } from '@etherealengine/engine/tests/util/createMockNetwork'
import { overrideFileLoaderLoad } from '@etherealengine/engine/tests/util/loadGLTFAssetNode'

import packageJson from '../../package.json'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState } from '@etherealengine/hyperflux'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'

overrideFileLoaderLoad()

// for easier debug
console.warn = () => {}

describe('Vehicle Functions Integration', async () => {


  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    Engine.instance.userId = Engine.instance.worldNetwork.hostId
    Engine.instance.peerID = 'peer id' as PeerID
    getMutableState(EngineState).publicPath.set('')
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('loadVehicleForEntity', () => {
    let i = 1
    
    it('should spawn vehicle ', async function () {
      const userId = `userId-${i}` as UserId

      const spawnAction = WorldNetworkAction.spawnVehicle({
        $from: userId,
        position: new Vector3(),
        rotation: new Quaternion(),
        networkId: i++ as NetworkId,
        uuid: userId
      })

      WorldNetworkActionReceptor.receiveSpawnObject(spawnAction as any)
      spawnVehicleReceptor(spawnAction)
      })
    })
})
