import { BigQuery } from '@google-cloud/bigquery';
import config from '../public/config';

// this is where we store the mappings:
const mappings = {};

// queries for each mapping:
const queries = {
  section: [
    `
      SELECT Section_ID AS id, Section_Name AS name
      FROM \`ism-data.raw_isap_metadata.sections_and_publishers_raw\`
      GROUP BY Section_ID, Section_Name
    `
  ],
  campaign: [
    `
      SELECT Campaign_ID AS id, Campaign_Name AS name
      FROM \`ism-data.raw_isap_metadata.campaigns_raw\`
      GROUP BY Campaign_ID, Campaign_Name
    `,
    `
      SELECT Id AS id, Name AS name
      FROM \`ism-data.raw_adzerk.campaigns_raw\`
      GROUP BY Id, Name
    `
  ],
  lineitem: [
    `
      SELECT Line_Item_ID AS id, Line_Item_Name AS name
      FROM \`ism-data.raw_isap_metadata.line_items_raw\`
      GROUP BY Line_Item_ID, Line_Item_Name
    `,
    `
      SELECT Id AS id, Name AS name
      FROM \`ism-data.raw_adzerk.flights_raw\`
      GROUP BY Id, Name
    `
  ],
  site: [
    `
      SELECT Id AS id, Title AS name
      FROM \`ism-data.raw_adzerk.sites_raw\`
      GROUP BY Id, Title
    `
  ]
};

export async function init(server) {
  // add an API route to get mappings:
  server.route({
    path: '/api/ism/mappings/{mappingId}',
    method: 'GET',
    handler(req, reply) {
      const mapping = mappings[req.params.mappingId];
      const result = mapping ? mapping.data || {} : {};

      reply(result);
    }
  });

  // load mappings:
  Object.keys(config.mappings).forEach(mappingId => loadMapping(mappingId));

  // refresh mappings every day:
  setInterval(function() {
    Object.keys(config.mappings).forEach(mappingId => loadMapping(mappingId));
  }, 86400 * 1000);
}

export async function loadMapping(mappingId) {
  const cfg = config.mappings[mappingId];
  const bq = new BigQuery({
    projectId: 'ism-data'
  });

  if (!mappings[mappingId]) {
    mappings[mappingId] = {};
  }

  mappings[mappingId].lastUpdated = (new Date()).getTime();
  mappings[mappingId].data = {};

  for (let i = 0; i < queries[mappingId].length; i++) {
    const [rows] = await bq.query({query: queries[mappingId][i]});

    for (let j = 0; j < rows.length; j++) {
      if (rows[j].id) {
        mappings[mappingId].data[rows[j].id] = rows[j].name;
      }
    }
  }

  console.log(JSON.stringify(mappings[mappingId], null, 2));
}
