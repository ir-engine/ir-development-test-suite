import { random } from 'lodash'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { dispatchAction } from '@xrengine/hyperflux'

import { defaultBonesData } from '@xrengine/engine/src/avatar/DefaultSkeletonBones'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkWorldAction } from '@xrengine/engine/src/networking/functions/NetworkWorldAction'

const logCustomTargetRigBones = (targetRig) => {
  if (targetRig.name !== 'custom') {
    return
  }

  console.log('check bones')
  defaultBonesData.forEach((boneData, index) => {
    const p = new Vector3(...boneData.position)
    const r = new Quaternion(...boneData.quaternion)
    const tbone = targetRig.tpose!.bones[index]
    console.log('    ', boneData.name, p.equals(tbone.bone.position), r.equals(tbone.bone.quaternion))
  })
  console.log('---------')
}

const avatars = ['Gold', 'Green', 'Pink', 'Red', 'Silver', 'Yellow']

const mockAvatars = () => {
  for (let i = 0; i < 100; i++) {
    const cyberbot = avatars[random(avatars.length)]
    const avatarDetail = {
      thumbnailURL: `/projects/default-project/avatars/Cyberbot${cyberbot}.png`,
      avatarURL: `/projects/default-project/avatars/Cyberbot${cyberbot}.glb`,
      avatarId: `Cyberbot${cyberbot}`
    }
    const userId = ('user' + i) as UserId
    const parameters = {
      position: new Vector3(0, 0, 0).random().setY(0).multiplyScalar(10),
      rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.random() * Math.PI * 2)
    }

    const networkId = (1000 + i) as NetworkId

    const world = Engine.currentWorld

    dispatchAction(world.store, {
      ...NetworkWorldAction.createClient({ name: 'user', index: networkId }),
      $from: userId
    })
    dispatchAction(world.store, {
      ...NetworkWorldAction.spawnAvatar({ parameters, prefab: 'avatar' }),
      networkId,
      $from: userId
    })
    dispatchAction(world.store, { ...NetworkWorldAction.avatarDetails({ avatarDetail }), $from: userId })
  }
}