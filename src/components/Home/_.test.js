import React from 'react'
import { shallow } from 'enzyme'
import View from './view'

it('renders without crashing', () => {
  shallow(<View example="Default State" updateExample={() => {}} />)
})