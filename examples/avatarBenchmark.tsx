import React, { useEffect, useState } from 'react'

import { AvatarState } from '@etherealengine/client-core/src/user/services/AvatarService'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import NumericInput from '@etherealengine/editor/src/components/inputs/NumericInput'
import { SelectInput } from '@etherealengine/editor/src/components/inputs/SelectInput'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { XRAction } from '@etherealengine/engine/src/xr/XRState'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { loadAssetWithIK, loadNetworkAvatar } from './utils/avatar/loadAvatarHelpers'
import { Template } from './utils/template'
import { NetworkObjectComponent } from '@etherealengine/engine/src/networking/components/NetworkObjectComponent'
import { AvatarNetworkAction } from '@etherealengine/engine/src/avatar/state/AvatarNetworkActions'
import { ikTargets } from '@etherealengine/engine/src/avatar/animation/Util'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import { Vector3 } from 'three'
import { useWorldNetwork } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'

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
//     if(NetworkState.worldNetwork && entities.length) {
//       const data = dataWriter(world, NetworkState.worldNetwork, entities)
//       console.log(data)
//       NetworkState.worldNetwork.incomingMessageQueueUnreliable.add(data)
//     }
//   }
// }

export default function AvatarBenchmarking() {
  const network = useWorldNetwork()
  const avatarList = useFind(avatarPath, { 
    query: {
      $skip: 0,
      $limit: 100
    }
  })

  const [count, setCount] = useState(100)
  const [avatarID, setAvatar] = useState('')

  const [entities, setEntities] = useState(0)

  useEffect(() => {
    getMutableState(EngineState).avatarLoadingEffect.set(false)

    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const indexStr = urlParams.get('count')
    if (indexStr) setCount(parseInt(indexStr))
  }, [])

  useEffect(() => {
    if (avatarList.data.length) setAvatar(avatarList.data[0].id)
  }, [avatarList.data.length])

  useEffect(() => {
    if (!avatarID || !network?.ready.value) return
    setEntities(count)
    for (let i = 0; i < count; i++) {
      const avatar = avatarList.data.find((val) => val.id === avatarID)!
      loadAssetWithIK(avatar, new Vector3(0, 0, i * 2), i)
    }
    return () => {
      for (let i = 0; i < entities; i++) removeEntity(NetworkObjectComponent.getUserAvatarEntity(('user' + i) as UserID))
    }
  }, [count, avatarID, network?.ready])

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
          options={avatarList.data.map((val) => ({ value: val.id, label: val.name }))}
          onChange={setAvatar}
          value={avatarID}
        />
        <NumericInput onChange={setCount} value={count} />
      </div>
    </>
  )
}
