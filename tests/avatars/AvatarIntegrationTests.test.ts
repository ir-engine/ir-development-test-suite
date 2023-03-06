import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@etherealengine/common/src/interfaces/NetworkId'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { loadDRACODecoder } from '@etherealengine/engine/src/assets/loaders/gltf/NodeDracoLoader'
import { AnimationManager } from '@etherealengine/engine/src/avatar/AnimationManager'
import { AvatarAnimationComponent, AvatarRigComponent } from '@etherealengine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import {
  loadAvatarModelAsset,
  setupAvatarForUser
} from '@etherealengine/engine/src/avatar/functions/avatarFunctions'
import { spawnAvatarReceptor } from '@etherealengine/engine/src/avatar/functions/spawnAvatarReceptor'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '@etherealengine/engine/src/networking/functions/WorldNetworkActionReceptor'
import { Physics } from '@etherealengine/engine/src/physics/classes/Physics'
import { createMockNetwork } from '@etherealengine/engine/tests/util/createMockNetwork'
import { overrideFileLoaderLoad } from '@etherealengine/engine/tests/util/loadGLTFAssetNode'
import { createGLTFLoader } from '@etherealengine/engine/src/assets/functions/createGLTFLoader'

import packageJson from '../../package.json'

overrideFileLoaderLoad()

// for easier debug
console.warn = () => {}

const avatarPath = `/packages/projects/projects/${packageJson.name}/avatars/`
const animGLB = '/packages/client/public/default_assets/Animations.glb'

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

describe('avatarFunctions Integration', async () => {
  before(async () => {
    await loadDRACODecoder()
  })

  beforeEach(async () => {
    createEngine()
    createMockNetwork()
    Engine.instance.gltfLoader = createGLTFLoader()
    Engine.instance.userId = Engine.instance.worldNetwork.hostId
    Engine.instance.publicPath = ''
    await Physics.load()
    Engine.instance.physicsWorld = Physics.createWorld()
    await AnimationManager.instance.loadDefaultAnimations(animGLB)
  })

  describe('loadAvatarForEntity', () => {
    const assetPaths = fetchAvatarList()
    for (const modelURL of assetPaths) {
      it('should bone match, and rig avatar ' + modelURL.replace(avatarPath, ''), async function () {
        const spawnAction = WorldNetworkAction.spawnAvatar({
          $from: Engine.instance.userId,
          position: new Vector3(),
          rotation: new Quaternion(),
          networkId: 1 as NetworkId
        })

        WorldNetworkActionReceptor.receiveSpawnObject(spawnAction)
        spawnAvatarReceptor(spawnAction)

        const entity = Engine.instance.getUserAvatarEntity(Engine.instance.userId)

        const avatar = getComponent(entity, AvatarComponent)
        // make sure this is set later on
        avatar.avatarHeight = 0
        avatar.avatarHalfHeight = 0

        // run the logic
        const model = await loadAvatarModelAsset(modelURL) as any
        setupAvatarForUser(entity, model)

        // do assertions
        const avatarComponent = getComponent(entity, AvatarComponent)

        assert(avatarComponent.model!.children.length)
        assert(avatarComponent.avatarHeight > 0)
        assert(avatarComponent.avatarHalfHeight > 0)

        const { rig } = getComponent(entity, AvatarRigComponent)
        assert(rig)
        assert(rig.Hips)
        assert(rig.Head)
        assert(rig.Neck)
        assert(rig.Spine || rig.Spine1 || rig.Spine2)
        assert(rig.LeftFoot)
        assert(rig.RightFoot)
        assert((rig.RightArm || rig.RightForeArm) && rig.RightHand)
        assert((rig.LeftArm || rig.LeftForeArm) && rig.LeftHand)
        assert((rig.RightUpLeg || rig.RightLeg) && rig.RightFoot)
        assert((rig.LeftUpLeg || rig.LeftLeg) && rig.LeftFoot)

        // TODO: this currently isn't working, the update method doesnt show up in the VRM object
        // assert.equal(hasComponent(entity, UpdatableComponent), asset.split('.').pop() === 'vrm')
      })
    }
  })
})
