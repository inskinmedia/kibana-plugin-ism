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

      _convert = {
        text(value) {
          if (mappings[value]) {
            return `${mappings[value]} (ID: ${value})`;
          }
          else {
            return value;
          }
        },

        html(value) {
          if (mappings[value]) {
            return `<span title="ID: ${value}">${mappings[value]}</span>`;
          }
          else {
            return `<span>${value}</span>`;
          }
        }
      }
    }

    return FF;
  });
});
