import React from 'react'

import { Entity } from '@etherealengine/ecs'
import { AvatarBenchmark } from '../engine/benchmarks/AvatarBenchmark'

// let entities = [] as Entity[]
// let entitiesLength = 0

// async function SimulateNetworkAvatarMovementSystem (world: World) {
//   const dataWriter = createDataWriter()
//   return () => {
//     if(entities.length !== entitiesLength) {
//       entities = []
//       for (let i = 0; i < entitiesLength; i++) {
//         const eid = AvatarComponent.getUserAvatarEntity('user' + i as UserID)
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

export const metadata = {
  title: 'Avatar Benchmark',
  description: ''
}

export default function (props: { sceneEntity: Entity }) {
  return <AvatarBenchmark rootEntity={props.sceneEntity} onComplete={() => {}} />
}

// export default function AvatarBenchmarking() {
//   const network = useWorldNetwork()
//   const avatarList = useFind(avatarPath, {
//     query: {
//       $skip: 0,
//       $limit: 100
//     }
//   })

//   const [count, setCount] = useState(100)
//   const [avatarID, setAvatar] = useState('')

//   const [entities, setEntities] = useState(0)

//   useEffect(() => {
//     getMutableState(AnimationState).avatarLoadingEffect.set(false)

//     const queryString = window.location.search
//     const urlParams = new URLSearchParams(queryString)
//     const indexStr = urlParams.get('count')
//     if (indexStr) setCount(parseInt(indexStr))
//   }, [])

//   useEffect(() => {
//     if (avatarList.data.length) setAvatar(avatarList.data[0].id)
//   }, [avatarList.data.length])

//   useEffect(() => {
//     if (!avatarID || !network?.ready.value) return
//     setEntities(count)
//     for (let i = 0; i < count; i++) {
//       const avatar = avatarList.data.find((val) => val.id === avatarID)!
//       // loadAssetWithIK(avatar, new Vector3(0, 0, i * 2), i)
//       loadNetworkAvatar(avatar, i)
//     }
//     return () => {
//       for (let i = 0; i < entities; i++) removeEntity(AvatarComponent.getUserAvatarEntity(('user' + i) as UserID))
//     }
//   }, [count, avatarID, network?.ready])

//   return (
//     <>
//       <Template />
//       <div
//         style={{
//           width: '50%',
//           display: 'flex',
//           flexDirection: 'column',
//           margin: 'auto',
//           paddingTop: '100px',
//           pointerEvents: 'all'
//         }}
//       >
//         <SelectInput
//           options={avatarList.data.map((val) => ({ value: val.id, label: val.name }))}
//           onChange={setAvatar}
//           value={avatarID}
//         />
//         <NumericInput onChange={setCount} value={count} />
//       </div>
//     </>
//   )
// }
