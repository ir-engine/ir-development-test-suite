import React from 'react'
import { Route, Switch } from 'react-router-dom'

const avatarBenchmark = React.lazy(() => import(`./examples/avatarBenchmark`))
const avatarTest = React.lazy(() => import(`./examples/avatarTest`))
const avatarTestByIndex = React.lazy(() => import(`./examples/avatarTestByIndex`))
const physicsBenchmark = React.lazy(() => import(`./examples/physicsBenchmark`))

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
