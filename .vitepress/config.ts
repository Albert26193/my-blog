import { defineConfig } from 'vitepress'
import { getPosts } from './theme/serverUtils'
import mathjax3 from 'markdown-it-mathjax3'
import UnoCSS from 'unocss/vite'

const customElements = [
  'math',
  'maction',
  'maligngroup',
  'malignmark',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mi',
  'mlongdiv',
  'mmultiscripts',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'ms',
  'mscarries',
  'mscarry',
  'mscarries',
  'msgroup',
  'mstack',
  'mlongdiv',
  'msline',
  'mstack',
  'mspace',
  'msqrt',
  'msrow',
  'mstack',
  'mstack',
  'mstyle',
  'msub',
  'msup',
  'msubsup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
  'math',
  'mi',
  'mn',
  'mo',
  'ms',
  'mspace',
  'mtext',
  'menclose',
  'merror',
  'mfenced',
  'mfrac',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'msqrt',
  'mstyle',
  'mmultiscripts',
  'mover',
  'mprescripts',
  'msub',
  'msubsup',
  'msup',
  'munder',
  'munderover',
  'none',
  'maligngroup',
  'malignmark',
  'mtable',
  'mtd',
  'mtr',
  'mlongdiv',
  'mscarries',
  'mscarry',
  'msgroup',
  'msline',
  'msrow',
  'mstack',
  'maction',
  'semantics',
  'annotation',
  'annotation-xml',
  'mjx-container',
  'mjx-assistive-mml'
]

//每页的文章数量
const pageSize = 10

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(mathjax3)
    }
  },
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
    nav: [
      {
        text: 'Blogs',
        items: [
          {
            text: 'pages',
            link: '/pages/index'
          },
          {
            text: 'timeline',
            link: '/timeline'
          }
        ]
      },
      { text: 'Tags', link: '/tags' },
      { text: 'About', link: '/about' }
      // { text: 'Airene', link: 'http://airene.net' }  -- External link test
    ],
    search: {
      provider: 'local'
    },
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
