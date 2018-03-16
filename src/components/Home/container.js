import React from 'react'
import { connect } from 'react-redux'
import { actions, selectors } from 'resources/home'

import View from './view'

const mapStateToProps = state => ({
  example: selectors.getExample(state)
})

const mapDispatchToProps = dispatch => ({
  updateExample: newState => dispatch(actions.example(newState))
})

export default connect(mapStateToProps, mapDispatchToProps)(View)