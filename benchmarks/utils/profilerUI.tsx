import { SystemUUID } from '@etherealengine/ecs'
import React, { useEffect, useState } from 'react'
import { ProfileState, SystemProfileData } from '../../engine/benchmarks/Profiling'

import('../../engine/benchmarks/Profiling')

export default function ProfilerUI(props: { systemUUIDs: SystemUUID[] }) {
  const { systemUUIDs } = props
  const [systemProfileData, SetSystemProfileData] = useState([] as ({ uuid: SystemUUID } & SystemProfileData)[])

  useEffect(() => {
    const id = setInterval(() => {
      SetSystemProfileData(
        systemUUIDs.map((uuid) => {
          return {
            uuid: uuid,
            ...ProfileState.GetProfileData(uuid)
          }
        })
      )
    }, 500)

    return () => {
      clearInterval(id)
    }
  }, [])

  return (
    <div className="ProfilerUI" style={{ position: 'absolute', right: 12, top: 12, textAlign: 'right' }}>
      {systemProfileData.map((profileData) => {
        return (
          <>
            <div>{`System: ${profileData.uuid}`}</div>
            <div>{`avg: ${Math.trunc(profileData.avgDuration * 1000) / 1000}ms \n max: ${
              Math.trunc(profileData.maxDuration * 1000) / 1000
            }ms`}</div>
          </>
        )
      })}
    </div>
  )
}
