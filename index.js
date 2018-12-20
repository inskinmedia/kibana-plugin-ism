import { init as initMappings } from './server/mappings';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'ism',
    uiExports: {
      fieldFormats: [
        'plugins/ism/field-formats'
      ]
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server) {
      initMappings(server);
    }
  });
}
