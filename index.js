import mappingsRoute from './server/routes/mappings';
import { resolve } from 'path';

export default function(kibana) {
  return new kibana.Plugin({
    require: ['kibana', 'elasticsearch'],
    name: 'ism',
    uiExports: {
      hacks: [
        resolve(__dirname, 'public/field-formats')
      ]
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server) {
      mappingsRoute(server);
    }
  });
}
