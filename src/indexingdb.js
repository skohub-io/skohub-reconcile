import elasticsearch from './elasticsearch'

const indexingdb = async ({ ES_NODE, ES_INDEX }) => {
  const es = elasticsearch({ node: ES_NODE, index: ES_INDEX })
  return {
// TODO: Add methods for API calls/queries
    getFollowers: es.getFollowers,
    addFollower: es.addFollower,
    removeFollower: es.removeFollower,
    saveMessage: async message => Promise.all([
      es.saveMessage(message)
    ])
  }
}

export default indexingdb
