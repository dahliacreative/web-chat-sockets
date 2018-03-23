import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Provider } from 'react-redux'

import store from 'store'
import App from 'components/App'
//import registerServiceWorker from 'registerServiceWorker'

const Routes = () => (
  <Provider store={store}>
    <Router>
      <Route path="/" component={App}/>
    </Router>
  </Provider>

)

ReactDOM.render(<Routes />, document.getElementById('root'))
//registerServiceWorker()
