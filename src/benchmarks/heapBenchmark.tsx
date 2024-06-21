import React, { useEffect, useState } from 'react'

import { buttonStyle, useRouteScene } from '../sceneRoute'
import ProfilerUI from './utils/profilerUI'

type Memory = {
  jsHeapSizeLimit: number
  totalJSHeapSize: number
  usedJSHeapSize: number
}

export const metadata = {
  title: 'Heap Benchmark',
  description: ''
}

let allocated: Int32Array[] = []

const allocate = () => {
  const size = 2048 * 512
  const alloc = new Int32Array(size)
  for (let i = 0; i < size; i++) alloc[i] = i
  allocated.push(alloc)
}

export default function HeapBenchmarkEntry() {
  const sceneEntity = useRouteScene()
  const [memory, setMemory] = useState(undefined as Memory | undefined)
  const [grow, setGrow] = useState(false)

  useEffect(() => {
    const memID = setInterval(() => {
      // Doesn't work on Safari, shocker
      // @ts-ignore
      const memory = performance.memory as Memory | undefined
      if (memory) {
        setMemory(memory)
      }
    }, 100)

    return () => {
      clearInterval(memID)
    }
  }, [])

  useEffect(() => {
    if (!grow) {
      allocated = []
      return
    }
    const allocID = setInterval(allocate, 100)
    return () => {
      clearInterval(allocID)
    }
  }, [grow])

  return sceneEntity && memory ? (
    <>
      <ProfilerUI systemUUIDs={[]} />
      <div style={{ position: 'absolute', right: 12, bottom: 36, textAlign: 'right', pointerEvents: 'auto' }}>
        <div>{`Used Heap: ${Math.trunc(memory.usedJSHeapSize * 0.000001)}mb`}</div>
        <button style={buttonStyle} onClick={() => setGrow(!grow)}>
          {grow ? 'Stop' : 'Grow'}
        </button>
      </div>
    </>
  ) : null
}
