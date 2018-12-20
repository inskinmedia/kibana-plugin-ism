import { BigQuery } from '@google-cloud/bigquery';
import config from '../config';

// this is where we store the mappings:
const mappings = {};

// queries for each mapping:
const queries = {
  section: `
    SELECT Section_ID AS id, Section_Name AS name
    FROM \`ism-data.raw_isap_metadata.sections_and_publishers_raw\`
    GROUP BY Section_ID, Section_Name
  `
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

  Object.keys(config.mappings).forEach(mappingId => loadMapping(mappingId));
}

export async function loadMapping(mappingId) {
  const cfg = config.mappings[mappingId];
  const bq = new BigQuery();

  const [rows] = await bq.query({query: queries[mappingId]});

  if (!mappings[mappingId]) {
    mappings[mappingId] = {};
  }

  mappings[mappingId].lastUpdated = (new Date()).getTime();
  mappings[mappingId].data = {};

  for (let i = 0; i < rows.length; i++) {
    mappings[mappingId].data[rows[i].id] = rows[i].name;
  }
}
