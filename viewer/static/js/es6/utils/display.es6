import * as _ from 'lodash';
import * as httpUtil from './http';
import * as DataUtil from './data';
import * as VocabUtil from './vocab';
import * as StringUtil from './string';
import * as displayGroups from '../displayGroups.json';
import moment from 'moment';
import 'moment/locale/sv';
moment.locale('sv');

export function getDisplayDefinitions() {
  return new Promise((resolve, reject) => {
    httpUtil.getResourceFromCache('/https://id.kb.se/vocab/display').then((result) => {
      resolve(result);
    }, (error) => {
      reject(error);
    });
  });
}

function getValueByLang(item, propertyId, displayDefs, langCode, context) {
  if (!langCode || typeof langCode === 'undefined') {
    throw new Error('getValueByLang was called with an undefined language code.');
  }
  const contextList = context[1];
  let contextProperty = propertyId;

  let translatedValue = item[contextProperty]; // Set original value

  if (contextList.hasOwnProperty(contextProperty) && !_.isPlainObject(contextList[contextProperty])) {
    contextProperty = contextList[contextProperty];
  }

  let byLangKey = '';
  for (const key in contextList) {
    if (contextList[key] !== null && contextList[key].hasOwnProperty('@id') && contextList[key]['@id'] === contextProperty) {
      byLangKey = key;
    }
  }
  if (item[byLangKey] && item[byLangKey][langCode]) {
    translatedValue = item[byLangKey][langCode];
  }
  return translatedValue;
}

export function getProperties(typeInput, level, displayDefs, settings) {
  if (!typeInput || typeof typeInput === 'undefined') {
    throw new Error('getProperties was called with an undefined type.');
  }
  if (_.isObject(typeInput) && !_.isArray(typeInput)) {
    throw new Error(
      'getProperties was called with an object as type parameter (should be a string or an array of strings).'
    );
  }
  const typeList = [].concat(typeInput);
  for (const type of typeList) {
    const lenses = displayDefs.lensGroups[level].lenses;
    let props = [];
    if (typeof lenses[type] !== 'undefined') {
      props = lenses[type].showProperties;
    }
    props = [].concat(props);
    _.remove(props, (x) => _.isObject(x));
    if (props.length > 0) {
      return props;
    } else if (level === 'cards') { // Try fallback to chip level
      props = getProperties(type, 'chips', displayDefs, settings);
      if (props.length > 0) {
        return props;
      }
    }
  }
  return [];
}

export function getDisplayObject(item, level, displayDefs, quoted, vocab, settings, context) {
  if (!item || typeof item === 'undefined') {
    throw new Error('getDisplayObject was called with an undefined object.');
  }
  if (!_.isObject(item)) {
    throw new Error('getDisplayObject was called with a non-object.');
  }
  let result = {};
  let trueItem = Object.assign({}, item);

  if (trueItem.hasOwnProperty('@id') && !trueItem.hasOwnProperty('@type')) {
    trueItem = DataUtil.getLinked(trueItem['@id'], quoted);
    if (!trueItem.hasOwnProperty('@type') && trueItem.hasOwnProperty('@id')) {
      return { 'label': StringUtil.removeDomain(trueItem['@id'], settings.removableBaseUris) };
    }
  }

  // Get the list of properties we want to show
  let properties = [];
  if (trueItem['@type'] && typeof trueItem['@type'] !== 'undefined') {
    properties = getProperties(trueItem['@type'], level, displayDefs, settings);
  } else {
    return {};
  }
  let usedLensType;
  if (properties.length === 0) { // If none were found, traverse up inheritance tree
    const baseClasses = VocabUtil.getBaseClassesFromArray(trueItem['@type'], vocab, settings.vocabPfx);
    for (let i = 0; i < baseClasses.length; i++) {
      if (typeof baseClasses[i] !== 'undefined') {
        properties = getProperties(baseClasses[i].replace(settings.vocabPfx, ''), level, displayDefs, settings);
        if (properties.length > 0) {
          usedLensType = baseClasses[i];
          break;
        }
      }
    }
    if (properties.length === 0) {
      // No props found, default to Resource class and get those
      usedLensType = 'Resource';
      properties = getProperties('Resource', level, displayDefs, settings);
    }
  }

  if (level === 'cards') {
    properties = ['@type'].concat(properties);
  }

  // Start filling the object with the selected properties
  for (let i = 0; i < properties.length; i++) {
    if (!_.isObject(properties[i])) {
      let valueOnItem = '';
      if (properties[i] === 'created' || properties[i] === 'modified') {
        valueOnItem = moment(item[properties[i]]).format('lll');
      } else {
        valueOnItem = getValueByLang(trueItem, properties[i], displayDefs, settings.language, context);
      }
      if (typeof valueOnItem !== 'undefined') {
        let value = valueOnItem;
        if (_.isObject(value) && !_.isArray(value)) {
          value = getItemLabel(value, displayDefs, quoted, vocab, settings, context);
          // value = getDisplayObject(value, 'chips', displayDefs, quoted, vocab, vocabPfx);
        } else if (_.isArray(value)) {
          const newArray = [];
          for (const arrayItem of value) {
            if (_.isObject(arrayItem) && (Object.keys(arrayItem).length > 1 || arrayItem[Object.keys(arrayItem)[0]] !== '')) {
              newArray.push(getItemLabel(arrayItem, displayDefs, quoted, vocab, settings, context));
            } else if (arrayItem.length > 0) {
              newArray.push(arrayItem);
            } else {
              console.warn("Array contained unknown item", arrayItem);
            }
          }
          value = newArray;
        }
        result[properties[i]] = value;
      } else if (properties.length < 3 && i === 0) {
        const rangeOfMissingProp = VocabUtil.getRange(properties[i], vocab, settings.vocabPfx);
        let propMissing = properties[i];
        if (rangeOfMissingProp.length > 0) {
          propMissing = rangeOfMissingProp[0];
        }
        const expectedClassName = StringUtil.labelByLang(
          propMissing, // Get the first one just to show something
          settings.language,
          vocab,
          settings.vocabPfx
        );
        result[properties[i]] = `{${expectedClassName} saknas}`;
      }
    }
  }
  if (_.isEmpty(result)) {
    window.lxlWarning(`DisplayObject was empty. @type was ${trueItem['@type']}. Used lens: "${usedLensType}".`, 'Item data:', trueItem);
    result = { 'label': '{Unknown}' };
  }
  return result;
}

export function getItemSummary(item, displayDefs, quoted, vocab, settings, context) {
  const card = getCard(item, displayDefs, quoted, vocab, settings, context);
  const summary = {
    categorization: [],
    header: [],
    info: [],
    identifiers: [],
    sub: [],
  };
  _.each(card, (value, key) => {
    let v = value;
    if (!_.isArray(value)) {
      v = [value];
    }
    if (displayGroups['header'].indexOf(key) !== -1) {
      summary['header'].push({ 'property': key, value: v });
    } else if (displayGroups['info'].indexOf(key) !== -1) {
      summary['info'].push({ 'property': key, value: v });
    } else if (displayGroups['identifiers'].indexOf(key) !== -1) {
      summary['identifiers'].push({ 'property': key, value: v });
    } else if (displayGroups['categorization'].indexOf(key) !== -1) {
      summary['categorization'].push({ 'property': key, value: v });
    } else {
      summary['sub'].push({ 'property': key, value: v });
    }
  });
  if (summary['header'].length === 0) {
    summary['header'].push({ property: 'error', value: `{${StringUtil.getUiPhraseByLang('Unnamed entity', settings.language)}}` });
  }
  return summary;
}

export function getItemLabel(item, displayDefs, quoted, vocab, settings, context) {
  const displayObject = getChip(item, displayDefs, quoted, vocab, settings, context);
  let rendered = StringUtil.extractStrings(displayObject).trim();
  if (item['@type'] && VocabUtil.isSubClassOf(item['@type'], 'Identifier', vocab, settings.vocabPfx)) {
    rendered = `${item['@type']} ${rendered}`;
  }
  return rendered;
}

export function getChip(item, displayDefs, quoted, vocab, settings, context) {
  return getDisplayObject(item, 'chips', displayDefs, quoted, vocab, settings, context);
}

export function getCard(item, displayDefs, quoted, vocab, settings, context) {
  return getDisplayObject(item, 'cards', displayDefs, quoted, vocab, settings, context);
}
