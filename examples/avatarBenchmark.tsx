import React, { useEffect, useState } from 'react'

import { LocationIcons } from '@etherealengine/client-core/src/components/LocationIcons'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LocationAction } from '@etherealengine/client-core/src/social/services/LocationService'
import { EngineState, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
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
import { useLoadEngineWithScene, useOfflineScene } from '@etherealengine/client-core/src/components/World/EngineHooks'
import { AppLoadingState } from '@etherealengine/engine/src/common/AppLoadingService'
import { useLoadLocationScene } from '@etherealengine/client-core/src/components/World/LoadLocationScene'

// let entities = [] as Entity[]
// let entitiesLength = 0

// async function SimulateNetworkAvatarMovementSystem (world: World) {
//   const dataWriter = createDataWriter()
//   return () => {
//     if(entities.length !== entitiesLength) {
//       entities = []
//       for (let i = 0; i < entitiesLength; i++) {
//         const eid = Engine.instance.getUserAvatarEntity('user' + i as UserId)
//         if(eid) entities.push(eid)
//       }
//     }
//     if(Engine.instance.worldNetwork && entities.length) {
//       const data = dataWriter(world, Engine.instance.worldNetwork, entities)
//       console.log(data)
//       Engine.instance.worldNetwork.incomingMessageQueueUnreliable.add(data)
//     }
//   }
// }

export default function AvatarBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))
  const appState = useHookstate(getMutableState(AppLoadingState).state)

  const projectName = 'default-project'
  const sceneName = 'default'
  const avatars = useHookstate(getMutableState(AvatarState))

  const [count, setCount] = useState(100)
  const [avatar, setAvatar] = useState(null! as AvatarInterface)

  const [entities, setEntities] = useState(0)

  useSimulateMovement()

  useLoadLocationScene()
  useOfflineScene({ projectName, sceneName, spectate: true })

  useEffect(() => {
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
    for (let i = 0; i < entities; i++) removeEntity(Engine.instance.getUserAvatarEntity('user' + i as UserId))
    setEntities(count)
    for (let i = 0; i < count; i++) loadNetworkAvatar(avatar, i)
  }, [count, avatar, engineState.joinedWorld])

  useLoadEngineWithScene({ injectedSystems: DefaultLocationSystems })

  return (
    <>
      {appState.value === 'START_STATE' && <LoadingCircle message={t('common:loader.loadingEngine')} />}
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', margin: 'auto', paddingTop: '100px', pointerEvents: 'all' }}>
        <SelectInput options={avatars.avatarList.value.map(val => ({ value: val, label: val.name }))} onChange={setAvatar} value={avatar} />
        <NumericInput onChange={setCount} value={count} />
      </div>
      <LocationIcons />
    </>
  )
}