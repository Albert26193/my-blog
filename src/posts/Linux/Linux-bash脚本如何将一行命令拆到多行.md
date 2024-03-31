---
author: Albert
date: 2024-03-03
date created: 2023-05-09
date updated: 2023-02-27 18:12
tags:
  - Blog
  - Linux
  - bash编程
title: Linux-bash脚本如何将一行命令拆到多行
---

# Linux-bash脚本如何将一行命令拆到多行

## 拆分命令的场景

- 有的时候一个命令实在太长了，可读性非常低，这个时候就需要将其拆到多行当中，用以提升可读性
- 比如下面的代码，用来把nvim当做man手册的阅读器

```shell
#!/bin/bash
# 函数名称：manpage
# 参数1：手册页章节号
# 参数2：手册页名称
function manpage {
    nvim -c ":Man $1 $2" -c ":set nonumber" -c ":set nowrap" -c ":set scrollbind" -c ":set foldmethod=manual" -c ":set foldlevel=1" -c "setlocal buftype=nofile" -c "setlocal bufhidden=hide" -c "nnoremap q :q<CR>" -c "nnoremap <C-f> <C-d>" -c "nnoremap <C-b> <C-u>"
}
```

- 可以利用`\`反斜杠来分行，这个符号用来告诉`shell`，在下一行当中继续输入命令
- 上面的代码拆分之后如下所示：

```shell
# set nonumber：关闭行号显示
# set nowrap：不换行显示
# set scrollbind：同步滚动
# set foldmethod=manual：手动折叠
# set foldlevel=1：折叠到第一层
# setlocal buftype=nofile：将缓冲区视为无文件类型
# setlocal bufhidden=hide：将缓冲区隐藏
# nnoremap q :q<CR>：将q键映射为退出man页面
# nnoremap <C-f> <C-d>：将Ctrl-f键映射为向下滚动半页
# nnoremap <C-b> <C-u>：将Ctrl-b键映射为向上滚动半页

function manpage {
    nvim -c ":Man $1 $2" \
        -c ":set nonumber" \
        -c ":set nowrap" \
        -c ":set scrollbind" \
        -c ":set foldmethod=manual" \
        -c ":set foldlevel=1" \
        -c "setlocal buftype=nofile" \
        -c "setlocal bufhidden=hide" \
        -c "nnoremap q :q<CR>" \
        -c "nnoremap <C-f> <C-d>" \
        -c "nnoremap <C-b> <C-u>"
}
```

- 注意：**`\`符号的后面，不可以有空格，不可以加注释！**
