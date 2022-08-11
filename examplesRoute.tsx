import React from 'react'
import { Route } from 'react-router-dom'

const loadExampleRoute = (props) => {
  const ExampleRoute = React.lazy(() => import(`./examples/${props.match.params.exampleName}.tsx`))
  return ExampleRoute ? <ExampleRoute /> : null
}

const ExampleRoutes = () => {
  return <Route path="/examples/:exampleName" component={loadExampleRoute} />
}

export default ExampleRoutes
