import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'
import mathjax3 from 'markdown-it-mathjax3'
import UnoCSS from 'unocss/vite'
import { customElements } from './theme/config/constant'
import { nav } from './theme/config/nav'
import { head } from './theme/config/head'

//每页的文章数量
const pageSize = 10

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(mathjax3)
    }
  },
  head,
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => customElements.includes(tag)
      }
    }
  },
  title: "🚀️Albert's Blog",
  base: '/',
  srcDir: './src',
  cacheDir: './node_modules/vitepress_cache',
  rewrites: {},
  description: 'vitepress,blog,blog-theme',
  ignoreDeadLinks: true,
  themeConfig: {
    posts: await getPosts(pageSize),
    website: 'https://github.com/Albert26193/my-blog',
    // 评论的仓库地址
    comment: {
      repo: 'airene/vitepress-blog-pure',
      themes: 'github-light',
      issueTerm: 'pathname'
    },
    search: {
      provider: 'local'
    },
    nav,
    outline: [2, 3],
    outlineTitle: 'Table of Contents',
    socialLinks: [{ icon: 'github', link: 'https://github.com/Albert26193/my-blog' }]
  } as any,
  srcExclude: ['README.md'], // exclude the README.md , needn't to compiler
  vite: {
    //build: { minify: false }
    server: { port: 5000 },
    plugins: [UnoCSS()]
  }
})
