---
author: Albert
date: 2024-03-31
date created: 2024-03-31
tags:
  - Blog
  - bash编程
  - Linux
  - gist
  - 折腾
title: Linux-批量建立硬链接上传博客
---

# Linux-批量建立硬链接上传博客

## 1. 需求

- 在 `obsidian` 当中，通过 `tags` 管理了一系列 `markdown` 文件
- 希望通过一个命令，将所有含有目标 `tags` 的 `markdown` 文件，进行批量筛选，构建硬链接到目标位置 `dist`
- 此外，还要具备去重功能，目标位置 `dist` 目录下，如果已经含有该文件，则不进行链接构建。

## 2. 具体实现

- 依赖 `fd` 和 `ripgrep` 等高效查询工具，可以大幅降低查询时间。

```bash
#!/bin/bash

function check_and_copy() {
	local tags=($1) # 将标签字符串拆分成数组
	local file=$2
	local dist_dir=$3

	local fileName="$(basename "${file}")"

	if fd -L "${fileName}" "${dist_dir}" | grep -q "md"; then
		# echo "${dist_dir}/${fileName} has existed, return ..."
		return 1
	fi

	# 构造匹配任一标签的正则表达式
	local pattern=""
	for tag in "${tags[@]}"; do
		if [[ -n "$pattern" ]]; then
			pattern+="|"
		fi
		pattern+="^\s*- $tag\$"
	done

	# 使用 rg 检查文件是否包含任一特定标签
	if rg -q "$pattern" "${file}"; then
		ln "$(realpath "${file}")" "${dist_dir}/"

		echo "${file} has has linked"
	else
		return 1
	fi
}

function copy_tag_files() {
	local tag_string="$1" # 将所有标签作为一个字符串传递
	local dist_dir="${HOME}/CodeSpace/my-blog/src/posts"

	# 确保目标目录存在
	if [[ ! -d "$dist_dir" ]]; then
		echo "${dist_dir} has not existed."
		exit 1
	fi

	find . -maxdepth 1 -type d -name "CS-*" | while read cs_src_dir; do
		echo "Processing directory: $cs_src_dir"
		fd . "$cs_src_dir" --extension md --follow | while read -r file; do
			check_and_copy "$tag_string" "$file" "$dist_dir"
		done
	done

	echo "finished"
}

# Usage example: Passing multiple tags separated by spaces
copy_tag_files "Blog algorithm back-end front-end interview"
```