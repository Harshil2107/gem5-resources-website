// This file is used to configure Next.js
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = undefined
let basePath = ''

if (isGithubActions) {
  console.log('Running on Github Actions')
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '')

  assetPrefix = `/${repo}/`
  basePath = `/${repo}`
}
// let isProd = process.env.NODE_ENV === 'production'
// isProd = false;
// isProd = true;

// get path of the websie hosted on github pages from the environment variable
// https://realm.mongodb.com/api/client/v2.0/app/data-ejhjf/graphql
module.exports = {
  assetPrefix: assetPrefix,
  basePath: basePath,
  images: {
    unoptimized: true,
    loader: 'akamai',
    path: '',
  },
  env: {
    BASE_PATH: basePath,
    PRIVATE_RESOURCES: {
      "versions": {
        dataSource: "gem5-vision",
        database: "gem5-vision",
        collection: "versions_test",
        url: "https://data.mongodb-api.com/app/data-ejhjf/endpoint/data/v1",
        name: "data-ejhjf",
        apiKey: "pKkhRJGJaQ3NdJyDt69u4GPGQTDUIhHlx4a3lrKUNx2hxuc8uba8NrP3IVRvlzlo",
        isMongo: true,
      },
      "test": {
        dataSource: "gem5-vision",
        database: "gem5-vision",
        collection: "versions_test",
        url: "https://data.mongodb-api.com/app/data-ejhjf/endpoint/data/v1",
        name: "data-ejhjf",
        apiKey: "pKkhRJGJaQ3NdJyDt69u4GPGQTDUIhHlx4a3lrKUNx2hxuc8uba8NrP3IVRvlzlo",
        isMongo: true,
      },
      "atharav": {
        url: "https://raw.githubusercontent.com/Gem5Vision/json-to-mongodb/simentic-version/kiwi.json",
        isMongo: false,
      },
      /* "gem5-resources": {
        dataSource: "gem5-vision",
        database: "gem5-vision",
        collection: "resources",
        url: "https://data.mongodb-api.com/app/data-ejhjf/endpoint/data/v1",
        name: "data-ejhjf",
        apiKey: "pKkhRJGJaQ3NdJyDt69u4GPGQTDUIhHlx4a3lrKUNx2hxuc8uba8NrP3IVRvlzlo",
      },
      "test": {
        name: "data-ejhjf",
        url: "https://data.mongodb-api.com/app/data-ejhjf/endpoint/data/v1",
        dataSource: "gem5-vision",
        database: "gem5-vision",
        collection: "resources_test",
        apiKey: "pKkhRJGJaQ3NdJyDt69u4GPGQTDUIhHlx4a3lrKUNx2hxuc8uba8NrP3IVRvlzlo",
      } */
    },
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return config;
  },
}
