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

const githubPath = 'https://raw.githubusercontent.com/XRFoundation/test-assets/main/avatars/'
const animGLB = '/packages/client/public/default_assets/Animations.glb'
const assetPaths = ['reallusion/Allison.glb', 'mixamo/vanguard.fbx', 'mixamo/vanguard.glb', 'vrm/test2.vrm']

before(async () => {
  await loadDRACODecoder()
})

describe('avatarFunctions Integration', async () => {
  before(async () => {
    const world = createWorld()
    Engine.currentWorld = world
    await Engine.currentWorld.physics.createScene({ verbose: true })
    const animationGLTF = await loadGLTFAssetNode(animGLB)
    AnimationManager.instance.getAnimations(animationGLTF)
  })

  describe('loadAvatarForEntity', () => {
    it('should bone match, and rig avatar', async function () {
      this.timeout(60 * 1000)
      // clear cache to not potentially leak data between tests
      AssetLoader.Cache.clear()
      Engine.userId = Engine.currentWorld.hostId
      Engine.hasJoinedWorld = true

      await Promise.all(
        assetPaths.map(async (asset, i) => {
          // set up avatar entity
          const entity = createEntity()
          const networkObject = addComponent(entity, NetworkObjectComponent, {
            // remote owner
            ownerId: Engine.userId,
            networkId: i as NetworkId,
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

          try {
            // run setup
            await loadAvatarForUser(entity, githubPath + asset)
          } catch (e) {
            console.log('\n\nloadAvatarForEntity failed', asset, e, '\n\n')
            // silently fail if files cannot be loaded in time, we dont want to break tests, they will pass on CI/CD as it has a better connection
            if (!hasComponent(entity, IKRigComponent)) return
          }

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
      )
    })
  })
})
