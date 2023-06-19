//import { VehicleState } from "@etherealengine/client-core/src/user/services/VehicleService"
import { VehicleInterface } from "@etherealengine/common/src/interfaces/VehicleInterface"
import { NetworkId } from "@etherealengine/common/src/interfaces/NetworkId"
import { PeerID } from "@etherealengine/common/src/interfaces/PeerID"
import { UserId } from "@etherealengine/common/src/interfaces/UserId"
//import { loadVehicleModelAsset, boneMatchVehicleModel, rigVehicleModel, setupVehicleModel, animateModel } from "@etherealengine/engine/src/vehicle/functions/vehicleFunctions"
import { Engine } from "@etherealengine/engine/src/ecs/classes/Engine"
//import { addComponent, getComponent, setComponent } from "@etherealengine/engine/src/ecs/functions/ComponentFunctions"
import { Network } from "@etherealengine/engine/src/networking/classes/Network"
import { NetworkPeerFunctions } from "@etherealengine/engine/src/networking/functions/NetworkPeerFunctions"
import { WorldNetworkAction } from "@etherealengine/engine/src/networking/functions/WorldNetworkAction"
import { dispatchAction, getMutableState } from "@etherealengine/hyperflux"
import { Vector3, Quaternion} from "three"

export const mockNetworkVehicles = (vehicleList: VehicleInterface[]) => {
  for (let i = 0; i < vehicleList.length; i++) {
    const userId = ('user' + i) as UserId & PeerID
    const index = (1000 + i) as NetworkId
    const column = i * 2

  
    NetworkPeerFunctions.createPeer(Engine.instance.worldNetwork as Network, userId, index, userId, index, userId)
    dispatchAction(
      WorldNetworkAction.spawnAvatar({
        position: new Vector3(0, 0, column),
        rotation: new Quaternion(),
        $from: userId,
        uuid: userId
      })
    )
  }
}

export const loadNetworkVehicle = (vehicle: VehicleInterface, i: number, u = 'user', x = 0) => {

  const userId = u + i as UserId & PeerID
  const index = (1000 + i) as NetworkId
  NetworkPeerFunctions.createPeer(Engine.instance.worldNetwork as Network, userId, index, userId, index, userId)
  dispatchAction(
    WorldNetworkAction.spawnVehicle({
      position: new Vector3(x, 0, i * 2),
      rotation: new Quaternion(),
      $from: userId,
      uuid: userId
    })
  )
  return userId
}



