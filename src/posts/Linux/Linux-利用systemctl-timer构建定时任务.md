---
author: Albert
date: 2024-04-19
tags:
  - Blog
  - Linux
  - 备忘录
title: Linux-利用systemctl-timer构建定时任务
---

# Linux-利用systemctl-timer构建定时任务

## 1. 为什么不用 `crontab`

- `crontab` 作为 `Linux` 定时任务的经典实现，是较为常规的做法，但是，`systemctl-timer` 具备**更好的日志呈现和更加精细的控制**。

## 2. 任务说明

- 我有一组 `backup` 的任务需要执行，这组任务已经利用 `shell` 编程组织到一个 `sh` 脚本文件当中了，其目录如下

```shell
# realpath ./backup_hdd.sh
/home/albert/remote-scripts/backup-scripts/backup_hdd.sh
```

- 定时任务的本质：_定时去执行 `backup_hdd.sh`_

## 3. 具体做法

### 3.1 编写 `service` 文件

```bash
# cat albert_backup.service
[Unit]
Description=Albert Scheduled Backup Task

[Service]
Type=oneshot
ExecStart=/home/albert/remote-scripts/backup-scripts/backup_hdd.sh

[Install]
WantedBy=multi-user.target
```

### 3.2 编写 `timer` 文件

```bash
# cat albert_backup.timer
[Unit]
Description=Timer for Albert Scheduled Backup

[Timer]
OnCalendar=*-*-* 05:30:00
# 或者使用相对时间
# OnBootSec=10min  # 开机后10分钟执行
# OnUnitActiveSec=24h  # 每24小时执行一次

# 链接到服务
Unit=albert_backup.service

[Install]
WantedBy=timers.target
```

### 3.3 加载 `service` 和 `timer`

```bash
sudo systemctl daemon-reload
sudo systemctl start albert_backup.timer
sudo systemctl enable albert_backup.timer
```
