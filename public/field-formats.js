import config from './config';
import { npSetup } from 'ui/new_platform';
import { FieldFormat } from '../../../src/plugins/data/public';

const ismFieldFormatters = Object.keys(config.mappings).map(function(mappingId) {
  const cfg = config.mappings[mappingId];
  let mappings = {};

  // load mappings from server:
  $.getJSON(`../api/ism/mappings/${mappingId}`, function(result) {
    mappings = result;
  });

  return class extends FieldFormat {
    static id = mappingId;
    static title = cfg.title;
    static fieldType = cfg.fieldType;

    convert(value, type) {
      if (mappings[value]) {
        switch (type) {
          case 'html':
            return `<span title="ID: ${value}">${mappings[value]}</span>`;

          case 'text':
            return `${mappings[value]} (ID: ${value})`;

          default:
            return mappings[value];
        }
      }
      else {
        return value;
      }
    }
  };
});

console.log('Registered ISM field formatters:', ismFieldFormatters);
npSetup.plugins.data.fieldFormats.register(ismFieldFormatters);
