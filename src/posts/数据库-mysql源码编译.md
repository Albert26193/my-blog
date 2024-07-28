---
author: Albert
date: 2024-07-16
date created: 2024-07-15
tags:
  - DB
  - Blog
title: 数据库-mysql源码编译
---

# 数据库-mysql源码编译

> [!TIP]
> - 推荐阅读： [在Debian 11中源码编译mysql 8.0.30 | Bruce's Blog](https://www.xiebruce.top/1811.html)

## 1. 前置说明

- 操作系统：`Debian 12.2`
- 硬件：
  - CPU：`AMD APEC 7302` * 2
  - 固态：长江存储 `pcie 4.0`，容量为 `2TiB`
  - 内存：`128GiB DDR3 ECC` 内存
- `Mysql` 版本为 `9.0.0`

---

- **此文档的目的在于编译、调试 `mysql` 源码，并非部署可用服务**
- 整体安装过程平滑，没有明显的依赖缺失、冲突等。

## 2. 构建流程

### 2.1 `git clone`

```sh
# clone 
git clone git@github.com:mysql/mysql-server.git

# cd to dir
cd mysql-server
```

- 查看当前版本：

```sh
# cat ./MYSQL_VERSION
MYSQL_VERSION_MAJOR=9
MYSQL_VERSION_MINOR=0
MYSQL_VERSION_PATCH=0
MYSQL_VERSION_EXTRA=
MYSQL_VERSION_MATURITY="INNOVATION"
```

### 2.2 安装必要依赖

- 升级 `apt` 包，并安装必要依赖

```sh
sudo apt update 
&& sudo apt install -y gcc g++ cmake pkg-config \
   libssl1.1 libssl-dev \ 
   libncurses5-dev libncursesw5-dev
```

### 2.3 编写 `cmake` 脚本

- 首先，在项目一级目录下，创建 `build` 目录

```sh
# mkdir 

mkdir build && cd build
```

- 在 `build` 目录下，创建 `cmake_up.sh` 脚本，用以便捷启动 `cmake` 

```sh

# @/build/cmake_up.sh
#!/bin/bash

function cmake_mysql_up {
	# #指定mysql的安装路径
	# -DCMAKE_INSTALL_PREFIX=/usr/local/mysql

	# #指定mysql进程监听套接字文件（数据库连接文件）的存储路径
	# -DMYSQL_UNIX_ADDR=/usr/local/mysql/mysql.sock

	# #指定配置文件的存储路径
	# -DSYSCONFDIR=/etc

	# #指定进程文件的存储路径
	# -DSYSTEMD_PID_DIR=/usr/local/mysql

	# #指定默认使用的字符集编码，如utf8
	# -DDEFAULT_CHARSET=utf8

	# #指定默认使用的字符集校对规则
	# -DDEFAULT_COLLATION=utf8_general_ci

	# #安装INNOBASE存储引擎
	# -DWITH_INNOBASE_STORAGE_ENGINE=1

	# #安装ARCHIVE存储引擎
	# -DWITH_ARCHIVE_STORAGE_ENGINE=1

	# #安装BLACKHOLE存储引擎
	# -DWITH_BLACKHOLE_STORAGE_ENGINE=1

	# #安装FEDERATED存储引擎
	# -DWITH_PERFSCHEMA_STORAGE_ENGINE=1

	# #指定数据库文件的存储路径
	# -DMYSQL_DATADIR=/usr/local/mysql/data

	# #指定boost的路径，
	# -DWITH_BOOST=boost

	# #生成便于systemctl管理的文件
	# -DWITH_SYSTEMD=1

	sudo cmake .. -DCMAKE_INSTALL_PREFIX=/opt/mysql-source-code/mysql \
		-DSYSTEMD_PID_DIR=/opt/mysql-source-code/mysql \
		-DMYSQL_DATADIR=/opt/mysql-source-code/mysql-data \
		-DWITH_INNOBASE_STORAGE_ENGINE=1 \
		-DWITH_DEBUG=1 \
		-DSYSCONFDIR=/opt/mysql-source-code/mysql-config \
		-DMYSQL_TCP_PORT=3316 \
		-DWITH_BOOST=/opt/mysql-source-code/boost \
		-DCMAKE_CXX_COMPILER=/usr/bin/g++ \
		-DFORCE_INSOURCE_BUILD=0 \
		-DDOWNLOAD_BOOST=1 \
		-DHAVE_DTRACE=1 \
		-DMYSQL_UNIX_ADDR=/opt/mysql-source-code/mysql/mysql.sock \
		-DWITH_SYSTEMD=0 \
		-DDEFAULT_CHARSET=utf8 \
		-DDEFAULT_COLLATION=utf8_general_ci
}

cmake_mysql_up
```

- 该脚本的目的，在于**有记录地**启动 `cmake` 

### 2.4 通过 `cmake` 构建 `makefile`

- 执行 `build/cmake_up.sh` 即可

```sh
sudo bash ./cmake_up.sh
```

- 这一步目的在于，构建出必要的 `makefile`，只是起到中间桥梁的作用，并非真正执行编译。
- 此步骤耗时大约 1 分钟左右。

### 2.5 通过 `makefile` 构建二进制文件

- 现在，可以看到 `build` 目录下已经有了一系列文件。

```sh
#  pwd && tree . -L 1
# /home/albert/remote-codespace/from-github/db/mysql-server/build
.
├── abi_check.out
├── archive_output_directory
├── bin -> ./runtime_output_directory
├── client
├── CMakeCache.txt
├── CMakeFiles
├── cmake_install.cmake
├── cmake_up.sh
├── components
├── CPackConfig.cmake
├── CPackSourceConfig.cmake
├── CTestTestfile.cmake
├── DartConfiguration.tcl
├── debian
├── Docs
├── extra
├── icudt73l.lnk
├── include
├── info_macros.cmake
├── install_manifest.txt
├── lib -> ./library_output_directory
├── libchangestreams
├── libgmock.a
├── libgmock_main.a
├── libgtest.a
├── libgtest_main.a
├── libmysql
├── library_output_directory
├── libs
├── libservices
├── make_dist.cmake
├── Makefile   # 此文件就是编译依赖的真正管理者
├── man
├── mysql-test
├── mysys
├── packaging
├── plugin
├── plugin_output_directory
├── router
├── runtime_output_directory
├── scripts
├── server_unittest_library_dummy.c
├── share
├── sql
├── sql-common
├── storage
├── strings
├── support-files
├── testclients
├── Testing
├── unittest
├── utilities
├── VERSION.dep
└── vio
```

- 可以看到，已经出现了 `makefile`, 此文件就是编译依赖的真正管理者。
- 执行编译命令，使用 `48` 个线程来编译，总耗时大约 `4` 分钟左右。

```sh
suod make install -j 48 
```

- 执行成功，在 `/opt/mysql-source-code/` 目录下创建目录，至如下状态：

```sh
# pwd:/opt/mysql-source-code
# tree . -L 1
.
├── mysql
├── mysql-config
├── mysql-data
├── mysql-log
├── mysql-pid
├── mysql-socket
└── tmp
```

- 基本的思想，运行态所需要的一切文件，都放置在 `/opt/mysql-source-code` 目录下。

## 3. 启动流程

### 3.1 创建配置文件

- 创建 `/opt/mysql-source-code/mysql-config/my.cnf`，并编辑：

```ini
[client]
port = 3306
socket = /opt/mysql-source-code/mysql-socket/mysql.sock
default-character-set=utf8mb4
 
[mysql]
default-character-set=utf8mb4
 
[mysqld]
bind-address = 0.0.0.0
user = root
port = 3306
basedir = /opt/mysql-source-code/
datadir = /opt/mysql-source-code/mysql-data
tmpdir = /opt/mysql-source-code/tmp
pid-file = /opt/mysql-source-code/mysql-pid/mysqld.pid
log-error = /opt/mysql-source-code/mysql-log/error.log
socket = /opt/mysql-source-code/mysql-socket/mysql.sock
default-storage-engine = innodb
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci
```

- 注意：`client` 和 `mysqld` 的读写 `socket` 目录需要一致

### 3.2 `init` 初始配置

- 执行如下命令，启动 `mysqld` 服务端。

```sh
cd opt/mysql-source-code/mysql/bin

# init
sudo ./mysqld --defaults-file=/opt/mysql-source-code/mysql-config/my.cnf \
  --initialize-insecure \
  --user=root
```

- 此处直接使用 `--initialize-insecure`，非安全模式启动，后面把密码改掉即可。
- 初始化成功之后，即可在 `opt/mysql-source-code/mysql-data` 下看到有写入的文件。

### 3.3 启动和关闭

- 在 `/opt/mysql-source-code/mysql/bin` 目录下，可以同时看到 `mysqld` 和 `mysqld_safe` 两个文件。实际上，`mysqld_safe` 是 `shell` 脚本，是用来启动 `mysqld` 的，有重启等等功能，通过 `mysqld_safe` 启动相对来说更好一些。
- 通过 `mysqld_safe` 启动，执行如下命令：

```sh
sudo ./mysqld_safe &
```

- 可将实例放到后台运行，不会阻塞当前 `shell` 会话。
---
- 如果需要管理实例，则可以通过 `opt/mysql-source-code/mysql/bin/mysqladmin` 二进制文件来管理，比如需要关闭实例：

```sh
cd opt/mysql-source-code/mysql/bin

./mysqladmin -u root shutdown
```

### 3.4 客户端连接

- 推荐安装客户端工具：[GitHub - dbcli/mycli: A Terminal Client for MySQL with AutoCompletion and Syntax Highlighting.](https://github.com/dbcli/mycli) 
- `mycli` 工具带有补全和高亮，还支持格式化输出，相对来说手感较好。
- 启动 `mysqld` 服务端后，执行如下命令即可连接

```sh
mycli -u root
```

### 3.4 修改密码

- 虽然此数据库只是调试使用，服务器也有简单的安全配置，但是，出于谨慎考虑，还是添加一个密码较好。
- 使用客户端连接之后，执行如下命令：
- 将 `123456` 改成实际的密码

```sh
mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
mysql> flush privileges;
```

### 3.5 说明

- 本文档并非生产环境下的部署，主要目的是为了探索 `mysql` 源码，因此，未进行 `systemctl` 等实际生产环境下的部署操作。
