import React from 'react'
import { Route, Switch, Link } from 'react-router-dom'
import Loadable from 'react-loadable'
import './styles/index.css'

const Loading = () => null
const loader = (loader) => Loadable({
  loader,
  loading: Loading
})

const Home = loader(() => import('components/Home'))

export default () => (
  <div className="page">
  <Link to="/">Home</Link>
    <Switch>
      <Route exact path="/" component={Home} />
    </Switch>
  </div>
)
