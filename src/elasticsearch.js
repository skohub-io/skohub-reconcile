import { Client } from '@elastic/elasticsearch'

const elasticsearch = ({ node, index }) => {
  const client = new Client({ node })
  return {
    saveMessage: async message => message.type === 'Create' &&
      client.index({ index, body: message.object, type: '_doc' }),

// TODO: adapt methods for API calls/queries to ES...
      getFollowers: async object => ((await client.db(db).collection('followers')
      .findOne({ object })) || { followers: [] }).followers,
    addFollower: async (object, actor) => client.db(db).collection('followers')
      .updateOne({ object }, { $setOnInsert: { object }, $addToSet: { followers: actor } }, { upsert: true }),
    removeFollower: async (object, actor) => client.db(db).collection('followers')
      .updateOne({ object }, { $pull: { followers: actor } }),
    getMessagesFor: async actor => ((await client.db(db).collection('messages')
      .find({ actor, type: 'Create' }).toArray()) || []).map(message => message.object),
    getMessage: async id => client.db(db).collection('messages')
      .findOne({ id }),
    saveMessage: async message => client.db(db).collection('messages')
      .replaceOne({ id: message.id }, message, { upsert: true })

  }
}

export default elasticsearch
