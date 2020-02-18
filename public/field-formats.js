import { fieldFormats } from 'ui/registry/field_formats';
import config from './config';

Object.keys(config.mappings).forEach(function(mappingId) {
  const cfg = config.mappings[mappingId];
  let mappings = {};

  // load mappings from server:
  $.getJSON(`../api/ism/mappings/${mappingId}`, function(result) {
    mappings = result;
  });

  fieldFormats.register(function(FieldFormat) {
    class FF extends FieldFormat {
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
              return value;
          }
        }
        else {
          return value;
        }
      }
    }

    return FF;
  });
});
