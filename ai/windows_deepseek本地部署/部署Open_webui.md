1.安装python 3.11
2.重启电脑并测试pip 是否能用
3.打开命令行 输入  pip install open-webui
4.安装完成以后 open-webui serve 直接启动就可以了
5.启动完成以后输入localhost://8080就可以访问openwebui了
7.openwebui一般来说会自动链接到ollama的模型上，如果连不上就去管理员设置页面配置之前在安装ollama时在环境变量里配置的端口
8.openwebui默认情况下会自己去请求openai的接口，需要去管理员设置页面里把openai的外部链接选项关了，不然每次访问都会卡