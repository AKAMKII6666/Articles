1.ollama用于管理和启动运行大模型，类似npm
2.https://ollama.com/ 去下载ollama
3.windows上直接安装
4.在windows的环境变量下配置ollama:
	4.1 在用户变量上新建OLLAMA_HOST = 0.0.0.0:11434  用于指定OLLAMA模型托管器暴露给UI组件的API端口
	4.2 （可选）在用户变量上新建 OLLAMA_MODELS = F:\OLLAMA_MODELS 用于指定OLLAMA模型的下载位置
5.重启电脑让环境变量生效
6.去这里找到模型:https://ollama.com/library/deepseek-r1
7.下载模型需要复制上面那个页面的命令，比如: ollama run deepseek-r1:32b,然后打开cmd 直接帖进去回车，模型开始下载，下载好以后自动运行。
8.ollama安装完成，并且可以直接在命令行里发问和回答








