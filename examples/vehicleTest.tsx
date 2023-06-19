import React, { useEffect } from 'react'

import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { loadNetworkVehicle,} from './utils/vehicle/loadVehicleHelpers'
import {VehicleInterface} from '@etherealengine/common/src/interfaces/VehicleInterface'
import { Template } from './vehicleTemplate'

export default function VehicleBenchmarking() {
  const engineState = useHookstate(getMutableState(EngineState))
  useEffect(() => {
    if (engineState.connectedWorld.value) {
      const car:VehicleInterface = {} // just keeping this empty , we can add in any details we might want to extarct from the gltf here, or anything else not included in the gltf
      loadNetworkVehicle(car, 1)

    }
  }, [engineState.connectedWorld])

  return <Template />
}
