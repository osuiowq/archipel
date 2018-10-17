import store from './store'
import FsScreen from './FsScreen'

export default {
  plugin: fsPlugin
}

async function fsPlugin (core, opts) {
  core.makeStore('fs', store)
  core.components.add('archiveTabs', FsScreen, { title: 'Files' })
}
