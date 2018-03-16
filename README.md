# Webapp Boilerplate

## Setting up the Project
- Clone the repo
- Run `yarn install`
- Run `yarn start`

### Available Scripts

#### `yarn start`
Runs the app in the development mode.  
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits.  
You will also see any lint errors in the console.

#### `yarn storybook`
Runs the storybooks styleguide.  
Open http://localhost:9009 to view it in the browser.

For information on how to write stories visit https://storybook.js.org/

#### `yarn test`
Launches the test runner in the interactive watch mode.

#### `yarn build`
Builds the app for production to the build folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.  
Your app is ready to be deployed!

## Adding a new resource

When adding a new resource, please follow the re-ducks pattern outline bellow, for more info visit https://github.com/alexnm/re-ducks. The index file exports all files, with the reducer being the default.

### Resource Structure
```
my-app/
  src/
    resources/
      resourceName/
        _.test.js
        actions.js
        index.js
        reducers.js
        selectors.js
        types.js
```

### Components

When adding a new component please follow the bellow structure, the index file will export the view and the container, with the container being the default.
```
my-app/
  src/
    components/
      ComponentName/
        styles/
          index.sass
        _.test.js
        container.js
        index.js
        stories.js
        view.js
```

### Prop Types

Each view / component should have their PropTypes defined, this helps debug things when something goes wrong, it also makes components easier to test.

### Tests

Every feature should have a series of tests to ensure quality of code. Tests should cover the following:
- Reducers
- Action Creators
- Selectors
- Container
- View

## Updating the store

When fetching data from an API, all resources should be stored at the top level inside an entities object, resources should be grouped by type and defined by `id`. You should avoid nesting at all costs as it makes updating the UI incredibly difficult.

Here is an example of how an entities object should look:

```
entities: {
  programmes: {
    101: {
      type: 'programme',
      title: 'My Cool TV Show',
      relationships: [{
        type: 'episode',
        id: 202
      }]
    },
    102: {
      type: 'programme',
      title: 'Another Cool TV Show',
      relationships: [{
        type: 'episode',
        id: 203
      }]
    }
  },
  episodes: {
    202: {
      type: 'episode',
      title: 'Episode 1'
    },
    203: {
      type: 'episode',
      title: 'Episode 1'
    }
  }
}
```

With your resources stored in this way, you can then use arrays of IDs to fetch the data you need from the store, for example:

```
{
  entities: {
    ...entities
  },
  catalogue: {
    filter: {
      ...catalogueFilters
    },
    currentPage: [101,102]
  }
}
```

```
const resources = store.catalogue.currentPage
resources.map(id => {
  const resource = store.entities.programmes[id]
  return (
    <p>{resource.title}</p>
  )
})
```
