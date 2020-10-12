const rawContributors = require('./contributors.json')
let stats
if (process.env.ENV_TYPE === 'mock') {
  stats = require('./mock-stats-generator')
} else {
  stats = require('./stats-generator')
}

const findCountryCode = require('./country-codes')

let contributors = {}
//Sort contributors github id in alphabetical order
Object.keys(rawContributors).sort().forEach(function(githubUserId) {
  contributors[githubUserId] = rawContributors[githubUserId];
});

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}) => {
  const { createNode } = actions

  return stats.fetchCountStats(Object.keys(contributors)).then(contributorStats => {
    // loop through data and create Gatsby nodes
    Object.entries(contributorStats).forEach(([contributor, information]) => {

      createNode({
        ...information,
        ...contributors[contributor],
        githubUserId: contributor,
        id: createNodeId(`${contributor}`),
        countryCode: findCountryCode(contributors[contributor].country),
        parent: null,
        children: [],
        internal: {
          type: 'contributor',
          content: JSON.stringify(information),
          contentDigest: createContentDigest(contributor),
        },
      })
    })
  }).catch(err => console.error())
}
