<script>
import * as _ from 'lodash';
import LensMixin from './mixins/lens-mixin';
import EntitySummary from './entity-summary';
import { getSettings, getVocabulary, getDisplayDefinitions, getEditorData } from '../vuex/getters';

export default {
  name: 'entity-search-item',
  mixins: [LensMixin],
  props: {
    focusData: {},
    disabledIds: [],
  },
  vuex: {
    getters: {
      vocab: getVocabulary,
      display: getDisplayDefinitions,
      settings: getSettings,
      editorData: getEditorData,
    },
  },
  data() {
    return {
      keyword: '',
      listItemSettings: {
        text: 'Add',
        styling: 'brand',
        event: 'add-entity',
        show: (this.disabledIds.indexOf(this.focusData['@id']) === -1),
      },
    }
  },
  methods: {
  },
  computed: {
    addPayload() {
      const updatedListItemSettings = _.merge({payload: this.focusData}, _.cloneDeep(this.listItemSettings));
      return updatedListItemSettings;
    },
  },
  components: {
    'entity-summary': EntitySummary,
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
  },
};
</script>

<template>
  <div class="search-result-item">
    <entity-summary :action-settings="addPayload" :focus-data="focusData" :lines="4" :add-link="true"></entity-summary>
  </div>
</template>


<style lang="less">
@import './_variables.less';

.search-result-item {
  border: solid #777;
  margin: 4px;
  border-width: 1px;
  code {
    color: @black;
  }
  &.already-added {
    opacity: 0.5;
    cursor: default;
  }
  .label {
    color: @black;
    font-weight: bold;
    font-size: 16px;
    display: inline-block;
    width: 74%;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .type {
    width: 24%;
    display: inline-block;
    text-align: right;
  }
  &:nth-child(even) {
    background-color: darken(@neutral-color, 2%);
  }
}

</style>
