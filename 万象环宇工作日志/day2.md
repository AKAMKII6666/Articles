# 2024年7月26日 21:43:03
------------------------------------------------
重构的事情暂时搁置，目前的方案为在之前代码的基础上继续进行。

今天的工作情况:

--1.向上个前端负责人沟通项目情况

    1.1.没有得到有价值的信息。

    1.2.结论是需要自己学习umi以及熟悉整体系统的业务代码。

--2.目前可以确定的一些事情:

    2.1.目前项目没有配置ssr或者ssg。

    2.2.目前项目的生成模式为单页应用，是网络请求阻塞的罪魁祸首,后期可能需要将一些可以动态载入的模块设置为动态载入。

    2.3.目前项目没有做自动化的环境变量切换，导致项目在本地/测试/正式环境里的接口请求的行为模糊不清,这个需要将环境变量切换逻辑构建出来，再配合运维做一些相关的配置。

    2.4.目前暂不清楚model的运行原理，需要进一步学习。

    2.5.目前暂不清楚问题最多的audio模块的业务代码逻辑，需要完成上一步的学习再进一步去查找原因。


接下来的工作计划:

1.利用空余时间全量学习一遍umi的使用。

2.在尽快完成umi的学习的基础上，将项目的目前业务代码快速读懂。

4.根据了解到的业务代码的基础上对现有bug进行修复，或对现有模块进行一些必要的重构。