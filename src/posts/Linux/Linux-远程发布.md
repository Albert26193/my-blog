---
author: Albert
date: 2024-02-25
date created: 2023-12-25
date updated: 2023-12-20 20:53
description: 运维过程当中的一些实践，作为备忘录使用。
tags:
  - Blog
  - Linux
  - 运维备忘录
title: Linux-远程发布
---

# Linux-远程发布

- 该脚本用来将本地的前端项目 `build` 并上传到远程服务器的指定目录下

- 前置条件：

1. 本地项目维护在 `git` 仓库下
2. 远程服务器 `ssh` 服务已经开启，且 `nginx` 正常运行。

```shell
#!/bin/bash

function buildBlog() {
    # 获取 Git 项目根目录和构建输出目录
    local gitPath="$(git rev-parse --show-toplevel)"
    local distPath="${gitPath}/.vitepress/dist"

    # 目标服务器和路径配置
    local targetPath="/opt/my-blog"
    local remoteHostAlias="aliyun.47.116.root"

    # 构建项目
    pnpm build || { echo "Build failed"; exit 1; }

    # 打包构建好的文件
    (cd "${gitPath}/.vitepress" && tar -czf "dist.tar.gz" "dist") || { echo "Tar failed"; exit 1; }

    # 将打包好的文件传输到远程服务器
    scp -r "${distPath}.tar.gz" "${remoteHostAlias}:${targetPath}" || { echo "SCP failed"; exit 1; }

    # 在远程服务器上执行一系列命令
    ssh ${remoteHostAlias} bash -c "'
        # rm -rf ${targetPath}/dist && rm -f ${targetPath}/dist.tar.gz
        tar -xzf ${targetPath}/dist.tar.gz -C ${targetPath} || { echo "Tar extract failed"; exit 1; }
        chown -R www-data:www-data ${targetPath} || { echo "Chown failed"; exit 1; }
        systemctl restart nginx || { echo "Nginx restart failed"; exit 1; }
    '"

    echo "Build and deployment successful"
}

buildBlog
```
