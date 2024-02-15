import esQueries from "../../queries/index.js";
import { config } from "../../config.js";

const buildReconcileUrl = (serviceUrl, account, dataset, language) => `${serviceUrl}/reconcile?language=${language}&account=${account}&dataset=${dataset}`

export default async function vocabs(req, res) {
  const combinations = await esQueries.getDatasetAccountCombination()
  const manifestUrls = combinations.map(c => {
    return {
      account: c.account,
      dataset: c.dataset,
      manifestUrl: Object.fromEntries(
        c.languages.map(l => ([
          l, buildReconcileUrl(config.app_baseurl, c.account, c.dataset, l)
        ]))
      )

    }
  })
  res.json(manifestUrls)
  return res
}
