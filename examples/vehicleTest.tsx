import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { mockNetworkVehicles,} from './utils/vehicle/loadVehicleHelpers'
import { Template } from './vehicleTemplate'

export default function VehicleBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))

  useEffect(() => {
    if (engineState.connectedWorld.value) {
      mockNetworkVehicles(10)       // just keeping this empty , we can add in any details we might want to extarct from the gltf here, or anything else not included in the gltf
    }
  }, [engineState.connectedWorld])
  
  /*useEffect(() => {
    if (engineState.connectedWorld.value) {
      dispatchAction(WorldNetworkAction.spawnVehicle({ uuid: 'test_vehicle'as UserId }))
    }
  }, [engineState.connectedWorld])*/

  return <Template />
}
