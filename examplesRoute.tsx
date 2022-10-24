import React from 'react'
import { Route, Switch } from 'react-router-dom'

import avatarBenchmark from './examples/avatarBenchmark'
import avatarTest from './examples/avatarTest'
import avatarTestByIndex from './examples/avatarTestByIndex'
import physicsBenchmark from './examples/physicsBenchmark'

const ExampleRoutes = () => {
  return (
    <Switch>
      <Route path="/examples/avatarBenchmark" component={avatarBenchmark} />
      <Route path="/examples/avatarTest" component={avatarTest} />
      <Route path="/examples/avatarTestByIndex" component={avatarTestByIndex} />
      <Route path="/examples/physicsBenchmark" component={physicsBenchmark} />
    </Switch>
  )
}

export default ExampleRoutes
