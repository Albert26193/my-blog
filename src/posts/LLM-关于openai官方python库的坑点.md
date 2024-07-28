---
author: Albert
date: 2024-05-14
date created: 2024-05-14
tags:
  - Blog
  - Bug收录
  - LLM
title: LLM-关于openai官方python库的坑点
---

# LLM-关于openai官方python库的坑点

## 1. 坑点罗列

1. **割裂升级问题**：一系列接口，如 `chatCompletion` 等常用接口，只在 `0.x.x` 支持，在 `1.x.x` 便不再支持。割裂升级带来了很大的兼容性问题。
2. **代理地址依然需要绕过 `GFW`**：*即便使用国内代理商的接口*，依然需要绕过 `GFW` 防火墙。所幸，在 `2024` 年，`openai` 的风控策略不是非常严格，常见的代理基本都可以支持。

## 2. 备忘录

- 如果需要透传环境变量，需要放在 `import openai` 之前

```python

os.environ["http_proxy"] = "http://xxx:xxx"
os.environ["https_proxy"] = "http://xxx:xxx"
os.environ["OPENAI_API_KEY"] = "sk-xxx"
os.environ["OPENAI_API_BASE"] = "https://api.xxx.com/v1"


# 引入放到下面
import openai
```

