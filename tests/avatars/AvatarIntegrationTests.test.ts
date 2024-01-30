import { loadDRACODecoderNode } from '@etherealengine/engine/src/assets/loaders/gltf/NodeDracoLoader'
import { Engine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { EngineState } from '@etherealengine/engine/src/EngineState'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { createMockNetwork } from '@etherealengine/engine/tests/util/createMockNetwork'
import { overrideFileLoaderLoad } from '@etherealengine/engine/tests/util/loadGLTFAssetNode'
import { getMutableState } from '@etherealengine/hyperflux'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { NetworkState } from '@etherealengine/spatial/src/networking/NetworkState'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import packageJson from '../../package.json'

import '@etherealengine/engine/src/EngineModule'

overrideFileLoaderLoad()

// for easier debug
console.warn = () => {}

const avatarPath = `/packages/projects/projects/${packageJson.name}/avatars/`
const animGLB = '/packages/projects/default-project/assets/Animations.glb'

const getAllFiles = (dirPath, arrayOfFiles) => {
  const avatarPathAbsolute = path.join(appRootPath.path, dirPath)
  const files = fs.readdirSync(avatarPathAbsolute)
  arrayOfFiles = arrayOfFiles || []
  files.forEach(function (file) {
    if (fs.statSync(avatarPathAbsolute + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file))
    }
  })
  return arrayOfFiles
}

const fetchAvatarList = () => {
  const assetPaths = getAllFiles(avatarPath, [])
  const avatarList = assetPaths.filter((url) => url.endsWith('glb'))
  return avatarList
}

describe.skip('avatarFunctions Integration', async () => {
  before(async () => {
    await loadDRACODecoderNode()
  })

  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    Engine.instance.userID = NetworkState.worldNetwork.hostId
    getMutableState(EngineState).publicPath.set('')
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
  })

  afterEach(() => {
    return destroyEngine()
  })

  // describe('loadAvatarForEntity', () => {
  //   const assetPaths = fetchAvatarList()
  //   let i = 1
  //   for (const modelURL of assetPaths) {
  //     it('should bone match, and rig avatar ' + modelURL.replace(avatarPath, ''), async function () {
  //       const userId = `userId-${i}` as UserID
  //       dispatchAction(
  //         AvatarNetworkAction.spawn({
  //           $from: userId,
  //           position: new Vector3(),
  //           rotation: new Quaternion(),
  //           networkId: i++ as NetworkId,
  //           entityUUID: userId as string as EntityUUID
  //         })
  //       )

  //       applyIncomingActions()

  //       await act(() => receiveActions(EntityNetworkState))

  //       const entity = UUIDComponent.entitiesByUUID[userId as any as EntityUUID]

  //       spawnAvatarReceptor(userId as string as EntityUUID)

  //       const avatar = getComponent(entity, AvatarComponent)
  //       // make sure this is set later on
  //       avatar.avatarHeight = 0
  //       avatar.avatarHalfHeight = 0

  //       // run the logic
  //       const model = (await loadAvatarModelAsset(modelURL)) as any
  //       setupAvatarForUser(entity, model)

  //       // do assertions
  //       const avatarComponent = getComponent(entity, AvatarComponent)

  //       assert(avatarComponent.model!.children.length)
  //       assert(avatarComponent.avatarHeight > 0)
  //       assert(avatarComponent.avatarHalfHeight > 0)

  //       const { rig } = getComponent(entity, AvatarRigComponent)
  //       assert(rig)
  //       assert(rig.hips.node)

  //       // TODO: this currently isn't working, the update method doesnt show up in the VRM object
  //       // assert.equal(hasComponent(entity, UpdatableComponent), asset.split('.').pop() === 'vrm')
  //     })
  //   }
  // })
})
