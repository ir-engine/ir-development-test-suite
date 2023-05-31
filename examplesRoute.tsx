import React from 'react'
import { Route, Routes } from 'react-router-dom'

import AvatarBenchmark from './examples/avatarBenchmark'
import AvatarTest from './examples/avatarTest'
import AvatarTestByIndex from './examples/avatarTestByIndex'
import PhysicsBenchmark from './examples/physicsBenchmark'
import Ktx2 from './examples/ktx2'

const ExampleRoutes = () => {
  return (
    <Routes>
      <Route path="/avatarBenchmark" element={<AvatarBenchmark />} />
      <Route path="/avatarTest" element={<AvatarTest />} />
      <Route path="/avatarTestByIndex" element={<AvatarTestByIndex />} />
      <Route path="/physicsBenchmark" element={<PhysicsBenchmark />} />
      <Route path="/ktx2" element={<Ktx2 />} />
    </Routes>
  )
}

export default ExampleRoutes
