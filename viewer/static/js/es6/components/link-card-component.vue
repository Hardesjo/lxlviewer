<script>

import { getSettings, getVocabulary, getVocabularyClasses, getDisplayDefinitions, getEditorData, getStatus, getChangeHistory } from '../vuex/getters';

export default {
  name: 'link-card',
  vuex: {
    getters: {
      settings: getSettings,
    },
    actions: {
    },
  },
  props: [
    "image",
    "linkUrl",
    "linkText",
    "header",
    "text",
  ],
  data() {
    return {
      keyword: '',
    }
  },
  methods: {
  },
  computed: {
  },
  components: {
  },
  watch: {
  },
  ready() { // Ready method is deprecated in 2.0, switch to "mounted"
    this.$nextTick(() => {
      // Do stuff
    });
  },
};
</script>

<template>
  <div class="panel panel-default link-card" v-bind:class="{'no-link': !linkUrl}">
    <img :src="image" />
    <span class="header">{{ header }}</span>
    <p>{{ text }}</p>
    <a v-if="linkUrl" :href="linkUrl" class="card-link">{{ linkText }}</a>
  </div>
</template>

<style lang="less">
@import './_variables.less';

.link-card {
  flex-basis: 24%; // To parent
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  &.no-link {
    padding-bottom: 1em;
  }
  img {
    width: 100%;
  }
  .header {
    font-weight: bold;
    font-size: 1.1em;
  }
  p {
    margin: 0px;
    flex-grow: 1;
    font-size: 14px;
  }
  p, .header {
    padding: 0.5em 1em 0em 1em;
    width: 100%;
    text-align: left;
  }
}

</style>
