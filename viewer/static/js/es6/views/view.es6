import * as UserUtil from '../utils/user';

export default class View {

  /*
    Base class for the "views".
  */

  constructor(name) {
    this.name = name;
    this.settings = {
      // vocabPfx: 'kbv:',
      vocabPfx: 'https://id.kb.se/vocab/',
      siteInfo: window.siteInfo,
      embeddedTypes: ['StructuredValue', 'ProvisionActivity', 'Contribution'],
      baseMaterials: [
        'https://id.kb.se/vocab/Instance',
        'https://id.kb.se/vocab/Work',
        'https://id.kb.se/vocab/Agent',
        // 'https://id.kb.se/vocab/Person'
        // 'https://id.kb.se/vocab/Organization',
        // 'https://id.kb.se/vocab/Meeting',
        // 'https://id.kb.se/vocab/Event',
        // 'https://id.kb.se/vocab/GenreForm',
        // 'https://id.kb.se/vocab/Topic',
      ],
      removableBaseUris: [
        'http://libris.kb.se/',
        'https://libris.kb.se/',
        'http://id.kb.se/',
        'https://id.kb.se/',
      ],
      specialProperties: [
        '@id',
        'sameAs',
        '@type',
        'issuanceType',
      ],
      disallowLocal: [
        'instanceOf',
      ],
      expandKeys: [
        'instanceOf',
        'itemOf',
      ],
      nonExtractableClasses: [
        'Place',
        'Library',
      ],
      propertyChains: {
        '@type': {
          sv: 'Typ',
          en: 'Type',
        },
        'carrierType': {
          sv: 'Bärartyp',
          en: 'Carrier type',
        },
        'issuanceType': {
          sv: 'Utgivningssätt',
          en: 'Issuance type',
        },
        'instanceOf.@type': {
          sv: 'Verkstyp',
          en: 'Type of work',
        },
        'instanceOf.contentType': {
          sv: 'Verksinnehållstyp',
          en: 'Content type of work',
        },
        'instanceOf.language': {
          sv: 'Verksspråk',
          en: 'Language of work',
        },
        'publication.date': {
          sv: 'Utgivningsdatum',
          en: 'Publication date',
        },
      },
      validSearchTags: [
        'isbn',
      ],
    };
  }

  initialize() {
    if (window.location.hash) {
      this.shiftWindow();
    }
    this.settings.language = $('html').attr('lang');
    this.settings.userSettings = UserUtil.loadUserSettings();
    $('.sigelLabel').text(`(${this.settings.userSettings.currentSigel})`);
    // console.log('Initialized view', this);
  }

  shiftWindow() {
    const navbarHeight = $('.navbar').height();
    if (navbarHeight) {
      scrollBy(0, -navbarHeight);
    }
  }
}
