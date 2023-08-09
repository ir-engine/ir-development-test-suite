import React, { useEffect, useState } from 'react'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { SelectInput } from '@etherealengine/editor/src/components/inputs/SelectInput'
import {
  xrTargetHeadSuffix,
  xrTargetLeftHandSuffix,
  xrTargetRightHandSuffix
} from '@etherealengine/engine/src/avatar/components/AvatarIKComponents'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { XRAction } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { loadNetworkAvatar } from './utils/avatar/loadAvatarHelpers'
import { useSimulateMovement } from './utils/avatar/simulateMovement'
import { Template } from './utils/template'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'

// let entities = [] as Entity[]
// let entitiesLength = 0

// async function SimulateNetworkAvatarMovementSystem (world: World) {
//   const dataWriter = createDataWriter()
//   return () => {
//     if(entities.length !== entitiesLength) {
//       entities = []
//       for (let i = 0; i < entitiesLength; i++) {
//         const eid = NetworkObjectComponent.getUserAvatarEntity('user' + i as UserID)
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
  const avatars = useHookstate(getMutableState(AvatarState))

  const [count, setCount] = useState(100)
  const [avatar, setAvatar] = useState('')

  const [entities, setEntities] = useState(0)

  useSimulateMovement()

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
    if (!avatar || !engineState.connectedWorld.value) return
    for (let i = 0; i < entities; i++) removeEntity(NetworkObjectComponent.getUserAvatarEntity(('user' + i) as UserID))
    setEntities(count)
    for (let i = 0; i < count; i++) {
      const userId = loadNetworkAvatar(avatars.avatarList.value.find((val) => val.id === avatar)!, i)
      dispatchAction({
        ...XRAction.spawnIKTarget({ handedness: 'none', entityUUID: (userId + xrTargetHeadSuffix) as EntityUUID }),
        $from: userId
      })
      dispatchAction({
        ...XRAction.spawnIKTarget({ handedness: 'left', entityUUID: (userId + xrTargetLeftHandSuffix) as EntityUUID }),
        $from: userId
      })
      dispatchAction({
        ...XRAction.spawnIKTarget({
          handedness: 'right',
          entityUUID: (userId + xrTargetRightHandSuffix) as EntityUUID
        }),
        $from: userId
      })
    }
  }, [count, avatar, engineState.connectedWorld])

  return (
    <>
      <Template />
      <div
        style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto',
          paddingTop: '100px',
          pointerEvents: 'all'
        }}
      >
        <SelectInput
          options={avatars.avatarList.value.map((val) => ({ value: val.id, label: val.name }))}
          onChange={setAvatar}
          value={avatar}
        />
        <NumericInput onChange={setCount} value={count} />
      </div>
    </>
  )
}
