import { createSelector } from 'reselect'

const home = state => state.home

const getExample = createSelector(home, (home) => home.example)

export {
  getExample
}