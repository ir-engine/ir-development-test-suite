import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { PeerID } from '@etherealengine/common/src/interfaces/PeerID'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { createGLTFLoader } from '@etherealengine/engine/src/assets/functions/createGLTFLoader'
import { loadDRACODecoderNode } from '@etherealengine/engine/src/assets/loaders/gltf/NodeDracoLoader'
import { AnimationManager } from '@etherealengine/engine/src/avatar/AnimationManager'
import {
  AvatarAnimationComponent,
  AvatarRigComponent
} from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { loadAvatarModelAsset, setupAvatarForUser } from '@etherealengine/engine/src/avatar/functions/avatarFunctions'
import { spawnAvatarReceptor } from '@etherealengine/engine/src/avatar/functions/spawnAvatarReceptor'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkActions'
import { destroyEngine, Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { Physics } from '@etherealengine/engine/src/physics/classes/Physics'
import { createMockNetwork } from '@etherealengine/engine/tests/util/createMockNetwork'
import { overrideFileLoaderLoad } from '@etherealengine/engine/tests/util/loadGLTFAssetNode'
import { applyIncomingActions, dispatchAction, getMutableState, receiveActions } from '@etherealengine/hyperflux'

import packageJson from '../../package.json'
import { EntityNetworkState } from '@etherealengine/engine/src/networking/state/EntityNetworkState'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
import { act } from '@testing-library/react'
import { PhysicsState } from '@etherealengine/engine/src/physics/state/PhysicsState'

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
    Engine.instance.gltfLoader = createGLTFLoader()
    Engine.instance.userID = Engine.instance.worldNetwork.hostId
    Engine.instance.peerID = 'peer id' as PeerID
    getMutableState(EngineState).publicPath.set('')
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
    await AnimationManager.instance.loadDefaultAnimations(animGLB)
  })

  afterEach(() => {
    return destroyEngine()
  })

  describe('loadAvatarForEntity', () => {
    const assetPaths = fetchAvatarList()
    let i = 1
    for (const modelURL of assetPaths) {
      it('should bone match, and rig avatar ' + modelURL.replace(avatarPath, ''), async function () {
        const userId = `userId-${i}` as UserID
        dispatchAction(AvatarNetworkAction.spawn({
          $from: userId,
          position: new Vector3(),
          rotation: new Quaternion(),
          networkId: i++ as NetworkId,
          entityUUID: userId as string as EntityUUID
        }))

        applyIncomingActions()
  
        await act(() => receiveActions(EntityNetworkState))

        const entity = UUIDComponent.entitiesByUUID[userId as any as EntityUUID]
  
        spawnAvatarReceptor(userId as string as EntityUUID)

        const avatar = getComponent(entity, AvatarComponent)
        // make sure this is set later on
        avatar.avatarHeight = 0
        avatar.avatarHalfHeight = 0

        // run the logic
        const model = (await loadAvatarModelAsset(modelURL)) as any
        setupAvatarForUser(entity, model)

        // do assertions
        const avatarComponent = getComponent(entity, AvatarComponent)

        assert(avatarComponent.model!.children.length)
        assert(avatarComponent.avatarHeight > 0)
        assert(avatarComponent.avatarHalfHeight > 0)

        const { rig } = getComponent(entity, AvatarRigComponent)
        assert(rig)
        assert(rig.hips.node)

        // TODO: this currently isn't working, the update method doesnt show up in the VRM object
        // assert.equal(hasComponent(entity, UpdatableComponent), asset.split('.').pop() === 'vrm')
      })
    }
  })
})
