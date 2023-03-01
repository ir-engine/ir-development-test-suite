import React, { useEffect, useState } from 'react'

import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LoadEngineWithScene } from '@etherealengine/client-core/src/components/World/LoadEngineWithScene'
import { OfflineLocation } from '@etherealengine/client-core/src/components/World/OfflineLocation'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { loadSceneJsonOffline } from '@etherealengine/client/src/pages/offline/utils'
import { useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { dispatchAction, getState, useHookstate } from '@etherealengine/hyperflux'
import { AvatarService, AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { SelectInput } from '@etherealengine/editor/src/components/inputs/SelectInput'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { AvatarInterface } from '@etherealengine/common/src/interfaces/AvatarInterface'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { loadNetworkAvatar } from './utils/loadAvatarHelpers'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { DefaultLocationSystems } from '@etherealengine/client-core/src/world/DefaultLocationSystems'
import { useSimulateMovement } from './utils/simulateMovement'

// let entities = [] as Entity[]
// let entitiesLength = 0

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

export default function AvatarBenchmarking() {
  const engineState = useEngineState()

  const projectName = 'default-project'
  const sceneName = 'default'
  const avatars = useHookstate(getState(AvatarState))

  const [count, setCount] = useState(100)
  const [avatar, setAvatar] = useState(null! as AvatarInterface)

  const [entities, setEntities] = useState(0)

  useSimulateMovement()

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
    setAvatar(avatars[0].get({ noproxy: true }))
  }, [avatars])

  useEffect(() => {
    if (!avatar || !engineState.joinedWorld.value) return
    for (let i = 0; i < entities; i++) removeEntity(Engine.instance.currentWorld.getUserAvatarEntity('user' + i as UserId))
    setEntities(count)
    for (let i = 0; i < count; i++) loadNetworkAvatar(avatar, i)
  }, [count, avatar, engineState.joinedWorld])

  return (
    <>
      {engineState.isEngineInitialized.value ? <></> : <LoadingCircle />}
      <LoadEngineWithScene spectate injectedSystems={DefaultLocationSystems} />
      <OfflineLocation />
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', margin: 'auto', paddingTop: '100px', pointerEvents: 'all' }}>
        <SelectInput options={avatars.avatarList.value.map(val => ({ value: val, label: val.name }))} onChange={setAvatar} value={avatar} />
        <NumericInput onChange={setCount} value={count} />
      </div>
      <LocationIcons />
    </>
  )
}