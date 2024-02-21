<template>
  <Layout>
    <template #doc-before>
      <div
        style="padding-top: 20px"
        class="post-info"
        v-if="!$frontmatter.page"
      >
        {{ $frontmatter.date?.substring(0, 10) }}
        <span
          v-for="item in $frontmatter.tags"
          class="mt-2 hover:.dark:bg-blue-500 hover:bg-blue-200 hover:.dark:text-slate-100"
        >
          <a :href="withBase(`/pages/tags.html?tag=${item}`)"> {{ item }}</a>
        </span>
      </div>
    </template>
  </Layout>
  <Copyright />
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import Copyright from './Copyright.vue'
import { withBase } from 'vitepress'
const { Layout } = DefaultTheme
</script>
