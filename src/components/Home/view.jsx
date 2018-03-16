import React from 'react'
import PropTypes from 'prop-types'
import './styles/index.css'

const Home = ({ example, updateExample, ...props }) => (
  <div>
    <h1>Homepage</h1>
    <p>{example}</p>
    <button onClick={() => { updateExample('New State Here!') }}>Update the state!</button>
  </div>
)

Home.propTypes = {
  example: PropTypes.string.isRequired,
  updateExample: PropTypes.func.isRequired
}

export default Home