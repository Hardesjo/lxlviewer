import View from './view';
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../vuex/store';
import * as _ from 'lodash';
import * as StringUtil from '../utils/string';
import * as SearchUtil from '../utils/search';
import * as VocabUtil from '../utils/vocab';
import * as DisplayUtil from '../utils/display';
import * as httpUtil from '../utils/http';
import ComboKeys from 'combokeys';
import KeyBindings from '../keybindings.json';
import MainSearchField from '../components/main-search-field';
import FacetControls from '../components/facet-controls';
import SearchResultComponent from '../components/search-result-component';
import EntitySearchList from '../components/entity-search-list';
import SearchForm from '../components/search-form';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData, getKeybindState, getStatus } from '../vuex/getters';
import { changeSettings, changeNotification, loadVocab, loadDisplayDefs, changeSavedStatus, changeResultListStatus } from '../vuex/actions';

export default class PagedCollection extends View {

  initialize() {
    super.initialize();
    // SearchUtil.initTypeButtons();
    // SearchUtil.initializeSearch();

    const self = this;
    this.dataIn = JSON.parse(document.getElementById('data').innerText);

    VocabUtil.getVocab().then((vocab) => {
      self.vocab = vocab['@graph'];
      DisplayUtil.getDisplayDefinitions().then((display) => {
        self.display = display;
        self.initVue();
      }, (error) => {
        // showError(error);
      });
    }, (error) => {
      // showError(error);
    });
  }

  initVue() {
    const self = this;

    document.getElementById('body-blocker').addEventListener('click', function () {
      self.vm.$broadcast('close-modals');
    }, false);

    Vue.filter('labelByLang', (label) => {
      return StringUtil.labelByLang(label, self.settings.language, self.vocab, self.settings.vocabPfx);
    });
    Vue.filter('removeDomain', (value) => {
      return StringUtil.removeDomain(value, self.settings.removableBaseUris);
    });
    Vue.filter('translatePhrase', (string) => {
      return StringUtil.getUiPhraseByLang(string, self.settings.language);
    });

    Vue.use(Vuex);

    self.vm = new Vue({
      el: '#PagedCollectionApp',
      vuex: {
        actions: {
          loadVocab,
          loadDisplayDefs,
          changeSettings,
          changeSavedStatus,
          changeNotification,
          changeResultListStatus,
        },
        getters: {
          status: getStatus,
          settings: getSettings,
          editorData: getEditorData,
          vocab: getVocabulary,
          display: getDisplayDefinitions,
          keybindState: getKeybindState,
        },
      },
      data: {
        initialized: false,
        combokeys: null,
        result: {},
      },
      events: {
        newresult(resultPromise) {
          resultPromise.then((result) => {
            this.result = result;
            this.changeResultListStatus('loading', false);
          }, (error) => {
            this.changeResultListStatus('error', true);
            this.changeResultListStatus('loading', false);
            this.changeResultListStatus('info', 'Could not find result');
            console.log(error);
          });
        },
      },
      watch: {

      },
      methods: {
        isArray(o) {
          return _.isArray(o);
        },
        isPlainObject(o) {
          return _.isPlainObject(o);
        },
      },
      ready() {
        this.changeSettings(self.settings);
        this.loadVocab(self.vocab);
        this.loadDisplayDefs(self.display);
        this.result = self.dataIn;
        this.initialized = true;
        history.replaceState(this.result, "TEST", this.result['@id']);
        if (Modernizr.history) {
          window.onpopstate = e => {
            this.changeResultListStatus('loading', true);
            const resultPromise = new Promise((resolve, reject) => {
              if (e.state !== null) {
                resolve(e.state);
              } else {
                reject(Error('State error'));
              }
            });
            this.$dispatch('newresult', resultPromise);
          };
        }
      },
      components: {
        'main-search-field': MainSearchField,
        'facet-controls': FacetControls,
        'search-result-component': SearchResultComponent,
        'entity-search-list': EntitySearchList,
        'search-form': SearchForm,
      },
      store,
    });
  }
}
