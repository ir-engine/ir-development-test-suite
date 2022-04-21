import assert from 'assert'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'

import { loadGLTFAssetNode } from '@xrengine/engine/tests/util/loadGLTFAssetNode'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { loadDRACODecoder } from '@xrengine/engine/src/assets/loaders/gltf/NodeDracoLoader'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { createWorld } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { IKPoseComponent } from '@xrengine/engine/src/ikrig/components/IKPoseComponent'
import { IKRigComponent, IKRigTargetComponent } from '@xrengine/engine/src/ikrig/components/IKRigComponent'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'
import { AnimationManager } from '@xrengine/engine/src/avatar/AnimationManager'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { loadAvatarForUser } from '@xrengine/engine/src/avatar/functions/avatarFunctions'
import { createAvatar } from '@xrengine/engine/src/avatar/functions/createAvatar'
import packageJson from '../../package.json'

// for easier debug
console.warn = () => {}

const avatarPath = `/packages/projects/projects/${packageJson.name}/avatars/`
const animGLB = '/packages/client/public/default_assets/Animations.glb'
const assetPaths = [
  'reallusion/Allison.glb',
  'mixamo/vanguard.glb',
  // TODO: vrm and fbx requires us to polyfill images in nodejs - this is a bit of work
  // 'mixamo/vanguard.fbx',
  // 'vrm/test2.vrm'
]

before(async () => {
  await loadDRACODecoder()
  const animationGLTF = await loadGLTFAssetNode(animGLB, true)
  AnimationManager.instance.getAnimations(animationGLTF)
})

describe('avatarFunctions Integration', async () => {
  beforeEach(async () => {
    const world = createWorld()
    Engine.currentWorld = world
    Engine.publicPath = ''
    await Engine.currentWorld.physics.createScene({ verbose: true })
    AssetLoader.Cache.clear()
    Engine.userId = Engine.currentWorld.hostId
    Engine.hasJoinedWorld = true
  })

  describe('loadAvatarForEntity', () => {
    for (const asset of assetPaths) {
      it('should bone match, and rig avatar ' + asset, async function () {
        // set up avatar entity
        const entity = createEntity()
        const networkObject = addComponent(entity, NetworkObjectComponent, {
          // remote owner
          ownerId: Engine.userId,
          networkId: 1 as NetworkId,
          prefab: '',
          parameters: {}
        })

        createAvatar(
          NetworkWorldAction.spawnAvatar({
            $from: Engine.userId,
            parameters: { position: new Vector3(), rotation: new Quaternion() },
            networkId: networkObject.networkId
          })
        )

        const avatar = getComponent(entity, AvatarComponent)
        // make sure this is set later on
        avatar.avatarHeight = 0
        avatar.avatarHalfHeight = 0


        // get the model asset
        const modelURL = avatarPath + asset
        const modelGLTF = await loadGLTFAssetNode(modelURL)

        // manually put it in the cache so it isnt fetched
        await AssetLoader.assetLoadCallback(modelURL, AssetLoader.getAssetType(modelURL), () => {})(modelGLTF)
        AssetLoader.Cache.set(modelURL, modelGLTF)


        // run the logic
        await loadAvatarForUser(entity, modelURL)
          

        // do assertions
        assert(hasComponent(entity, IKRigComponent))
        assert(hasComponent(entity, IKPoseComponent))
        assert(hasComponent(entity, IKRigTargetComponent))
        const avatarComponent = getComponent(entity, AvatarComponent)

        assert(avatarComponent.modelContainer.children.length)
        assert(avatarComponent.avatarHeight > 0)
        assert(avatarComponent.avatarHalfHeight > 0)

        const { boneStructure } = getComponent(entity, IKRigComponent)
        assert(boneStructure)
        assert(boneStructure.Hips)
        assert(boneStructure.Head)
        assert(boneStructure.Neck)
        assert(boneStructure.Spine || boneStructure.Spine1 || boneStructure.Spine2)
        assert(boneStructure.LeftFoot)
        assert(boneStructure.RightFoot)
        assert((boneStructure.RightArm || boneStructure.RightForeArm) && boneStructure.RightHand)
        assert((boneStructure.LeftArm || boneStructure.LeftForeArm) && boneStructure.LeftHand)
        assert((boneStructure.RightUpLeg || boneStructure.RightLeg) && boneStructure.RightFoot)
        assert((boneStructure.LeftUpLeg || boneStructure.LeftLeg) && boneStructure.LeftFoot)

        // TODO: this currently isn't working, the update method doesnt show up in the VRM object
        // assert.equal(hasComponent(entity, UpdatableComponent), asset.split('.').pop() === 'vrm')
      })
    }
  })
})
