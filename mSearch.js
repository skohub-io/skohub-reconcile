

'use strict'

import { Client } from '@elastic/elasticsearch'

const  client = new Client({ node: `http://localhost:9200` })


async function run () {
  const bulkResponse = await client.bulk({
    refresh: true,
    operations: [
      { index: { _index: 'game-of-thrones' } },
      {
        character: 'Ned Stark',
        quote: 'Winter is coming.'
      },

      { index: { _index: 'game-of-thrones' } },
      {
        character: 'Daenerys Targaryen',
        quote: 'I am the blood of the dragon.'
      },

      { index: { _index: 'game-of-thrones' } },
      {
        character: 'Tyrion Lannister',
        quote: 'A mind needs books like a sword needs a whetstone.'
      }
    ]
  })

  if (bulkResponse.errors) {
    console.log(bulkResponse)
    process.exit(1)
  }

  const result = await client.msearch({
    searches: [
      { index: 'game-of-thrones' },
      { query: { match: { character: 'Daenerys' } } },

      { index: 'game-of-thrones' },
      { query: { match: { character: 'Tyrion' } } }
    ]
  })

  console.log(result.responses)
}

run().catch(console.log)

