<template>
  <div class="tags">
    <span
      @click="toggleTag(String(key))"
      v-for="(_, key) in data"
      class="tag hover:.dark:bg-blue-500 hover:bg-blue-200"
    >
      {{ key }}
      <span class="count">{{ data[key].length }}</span>
    </span>
  </div>
  <div class="tag-header mt-6 mb-2 mr-1">{{ selectTag }}</div>
  <a
    :href="withBase(article.regularPath)"
    v-for="(article, index) in data[selectTag]"
    :key="index"
    class="posts"
  >
    <div class="post-container .dark:text-slate-200 font-bold mt-1 text-slate-900">
      <div class="post-dot"></div>
      {{ article.frontMatter.title }}
    </div>
    <div class="date">{{ article.frontMatter.date }}</div>
  </a>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { initTags } from '../functions'
let url = location.href.split('?')[1]
let params = new URLSearchParams(url)
const { theme } = useData()
const data = computed(() => initTags(theme.value.posts))
let selectTag = ref(params.get('tag') ? params.get('tag') : '')
const toggleTag = (tag: string) => {
  selectTag.value = tag
}
</script>

<style scoped>
.tags {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  font-weight: 600;
}
.tags .count {
  margin-left: 4px;
  font-weight: 700;
  font-size: 1rem;
  margin-left: 8px;
  color: var(--tag-count-color);
}

.tags .count:hover {
  color: var(--tag-hover-color);
}

.tag {
  display: inline-block;
  padding: 4px 16px;
  margin: 6px 8px;
  font-size: 0.875rem;
  line-height: 25px;
  background-color: var(--tag-info-color);
  transition: 0.4s;
  border-radius: 12px;
  color: var(--vp-c-text-1);
  cursor: pointer;
}
.tag-header {
  font-size: 1.5rem;
  font-weight: 500;
  text-align: left;
}

@media screen and (max-width: 768px) {
  .tag-header {
    font-size: 1.5rem;
  }
  .date {
    font-size: 0.75rem;
  }
}
</style>
