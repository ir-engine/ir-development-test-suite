import React, { useEffect, useState } from 'react'

import { LocationIcons } from '@xrengine/client-core/src/components/LocationIcons'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@xrengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@xrengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@xrengine/client-core/src/social/services/LocationService'
import { loadSceneJsonOffline } from '@xrengine/client/src/pages/offline/utils'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction, getState, useHookstate } from '@xrengine/hyperflux'
import { AvatarService, AvatarState } from '@xrengine/client-core/src/user/services/AvatarService'
import { accessAuthState, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { SelectInput } from '@xrengine/editor/src/components/inputs/SelectInput'
import NumericInput from '@xrengine/editor/src/components/inputs/NumericInput'
import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { loadAssetWithAnimation, loadNetworkAvatar } from './utils/loadAvatarHelpers'
import { Vector3 } from 'three'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { createDataWriter, writeEntities, writeMetadata } from '@xrengine/engine/src/networking/serialization/DataWriter'
import { createViewCursor, sliceViewCursor } from '@xrengine/engine/src/networking/serialization/ViewCursor'
import { DefaultLocationSystems } from '@xrengine/client-core/src/world/DefaultLocationSystems'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { RigidBodyComponent } from '@xrengine/engine/src/physics/components/RigidBodyComponent'

let entities = [] as Entity[]
let entitiesLength = 0

// async function SimulateNetworkAvatarMovementSystem (world: World) {
//   const dataWriter = createDataWriter()
//   return () => {
//     if(entities.length !== entitiesLength) {
//       entities = []
//       for (let i = 0; i < entitiesLength; i++) {
//         const eid = world.getUserAvatarEntity('user' + i as UserId)
//         if(eid) entities.push(eid)
//       }
//     }
//     if(world.worldNetwork && entities.length) {
//       const data = dataWriter(world, world.worldNetwork, entities)
//       console.log(data)
//       world.worldNetwork.incomingMessageQueueUnreliable.add(data)
//     }
//   }
// }

async function SimulateAvatarMovementSystem(world: World) {
  const execute = () => {
    if (entities.length !== entitiesLength) {
      entities = []
      for (let i = 0; i < entitiesLength; i++) {
        const eid = world.getUserAvatarEntity('user' + i as UserId)
        if (eid) entities.push(eid)
      }
    }
    const x = Math.sin(Date.now() / 1000) * 3
    for (const entity of entities) {
      const { position } = getComponent(entity, TransformComponent)
      position.x = x
      const { linearVelocity } = getComponent(entity, RigidBodyComponent)
      linearVelocity.x = 1
    }
  }

  return { execute, cleanup: async () => { } }
}

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'
  const avatars = useHookstate(getState(AvatarState))

  const [count, setCount] = useState(100)
  const [avatar, setAvatar] = useState(null! as AvatarInterface)

  const [entities, setEntities] = useState(0)

  useEffect(() => {
    AvatarService.fetchAvatarList()
    dispatchAction(LocationAction.setLocationName({ locationName: `${projectName}/${sceneName}` }))
    loadSceneJsonOffline(projectName, sceneName)

    engineState.avatarLoadingEffect.set(false)

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const indexStr = urlParams.get('count')
    if (indexStr) setCount(parseInt(indexStr))
  }, [])

  useEffect(() => {
    if (engineState.isEngineInitialized.value) {
      initSystems(Engine.instance.currentWorld, [
        {
          systemLoader: () => Promise.resolve({ default: SimulateAvatarMovementSystem }),
          uuid: 'SimulateAvatarMovement',
          type: SystemUpdateType.FIXED
        }
      ])
    }
  }, [engineState.isEngineInitialized])

  useEffect(() => {
    setAvatar(avatars[0].get({ noproxy: true }))
  }, [avatars])

  useEffect(() => {
    if (!avatar || !engineState.joinedWorld.value) return
    for (let i = 0; i < entities; i++) removeEntity(Engine.instance.currentWorld.getUserAvatarEntity('user' + i as UserId))
    entitiesLength = count
    setEntities(count)
    for (let i = 0; i < count; i++) loadNetworkAvatar(avatar, i)
  }, [count, avatar, engineState.joinedWorld])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene injectedSystems={DefaultLocationSystems} />
      <OfflineLocation />
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', margin: 'auto', paddingTop: '100px' }}>
        <SelectInput options={avatars.avatarList.value.map(val => ({ value: val, label: val.name }))} onChange={setAvatar} value={avatar} />
        <NumericInput onChange={setCount} value={count} />
      </div>
      <LocationIcons />
    </>
  )
}