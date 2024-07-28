---
author: Albert
date: 2024-05-12
date created: 2024-05-12
tags:
  - Blog
  - Linux
  - 备忘录
title: Linux-Ollama部署备忘录
---

# Linux-Ollama部署备忘录

## 1. 什么是 `Ollama`

- `Ollama` 是基于 `Go`  语言的项目，目的在于*简化开源大模型的部署、微调和工程化开发*。
- 其项目的底座是 `ollama.cpp` 项目，该项目能够利用*量化模型*，降低本地大模型的硬件门槛，对于规模相对较小（ `7b` 左右的模型），利用 `CPU + RAM` 就可以实现速度相对可用的推理。
- 因此，部署此项目可以借助较低成本，实现本地大模型的服务化。

## 2. 部署记录

- 本次部署的环境为 `Debian 12.2`
- `Ollama` 部署的难度非常小。其部署的简易性来源于两个方面：
  1. 国内的 `GFW` 对于其网络服务的限制较小，几乎没有收到防火墙的影响；
  2. `Ollama` 官方实现了脚本化的封装，利用 `systemctl` 大幅简化部署过程中的困难。
- 部署过程如下所示：

### 2.1 下载脚本

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2.2 调整环境变量

```bash
# sudo vim /etc/systemd/system/ollama.service

[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="PATH=/data/other/anaconda3/bin:xxxxxx" # change to bin
Environment="OLLAMA_ORIGINS=*.albert.cool"
Environment="OLLAMA_HOST=0.0.0.0"
Environment="NVARCH=x86_64"
Environment="NV_CUDA_CUDART_VERSION=11.6"
Environment="NVIDIA_VISIBLE_DEVICES=all"
Environment="OLLAMA_MODELS=/data/ollama/models"

[Install]
WantedBy=default.target
```

- 如果在客户端调用，需要调整 `CORS` 配置
- 需要注意是否识别到显卡驱动
- 修改完成之后，执行以下命令

```bash
sudo systemctl daemon-reload \
&& sudo systemctl restart ollama \
&& sudo systemctl status ollama -l
```

### 2.3 拉取模型

- 按照如下方式可以一键拉取运行

```bash
ollama run llama3:70b
```

### 2.4 查看日志

```bash
journalctl -e -u ollama
```

## 3. 硬件要求

- `2060` 显卡：大约能够流畅运行 `13b` 规模模型，规模变大之后就会很卡。
- `3090` 显卡：能够流畅运行 `70b` 规模模型，尝试 `mixtral:8x22b`，基本上不可用。`qwen:110b` 也存在显卡瓶颈。
- 无 `GPU`：能够流畅运行 `7b` 规模模型，模型规模稍大则几乎不可用。