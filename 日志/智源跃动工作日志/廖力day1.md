廖力工作日志 2025-12-03

1.完成入职程序
	1.完成eparkapp的安装
	2.完成公司工作节奏介绍
2.拉取主要项目的git源码
	gitlab：
	http://gitlab.tokenleap.cn/users/sign_in
	账号:
	281191341@qq.com
	密码:
	qaz7845120
3. 已经完成拉取
	1.阅读并理解源码
		1. 目前看来这个项目使用的是react + nextjs + prisma
			推测这个项目是一个大前端项目，使用nextjs承载后端以及数据库访问
			
			但是仍有几个问题需要查看并了解清楚:
			1.这个项目的nextjs使用的是SSR还是SSG
				不是ssr 是csr 可能后期需要改成ssr或者ssg

			2.这个项目的后端目录在哪，使用的服务端是单纯的express还是nest还是nextjs自带的后端中间件
				后端在app/api里面
				该项目为全栈 Next.js 应用


			3.这个项目的具体形态是什么样的?
				项目概览：

				这是一个 CSR 为主的全栈 Next.js 应用，后端使用 Route Handlers，适合需要丰富交互和实时数据的场景。

				这个项目使用的是 React 19
				这个项目使用的是Next.js 15.2.1
				使用NextAuth 5.0进行鉴权
				样式方面: Radix UI + Tailwind CSS + Ant Design
				状态管理：Zustand + React Query (TanStack Query)
				其它方面: Socket.io、ECharts、React Hook Form、Zod

				外部服务集成
				阿里云 OSS（对象存储）
				火山引擎 TOS（视频相关）
				阿里云 IMM（智能媒体管理）
				蚁小二（账号托管，通过 webhook 数据回流）
			
			4.这个项目使用的是next.js文件系统路由



	2.按照环境跑通并运行代码
	--已经完成

	3.未来三天规划:
		1.了解NextAuth并熟悉其原理
		2.了解Radix UI  Tailwind CSS
		3.了解 Zustand  React Query
		4.了解 Socket.io
		5.了解 Zod
	
	4.测试环境登录账号密码:
	 admin
	 admin123
	 正式环境地址:
	 	http://contelink.cn/videoClip

今天的任务:
1.完成入职程序 -- 已完成
2.拉取主项目源代码 -- 已完成
3.跑通本地代码 -- 已完成
4.解决代码缩进不符合我个人习惯的问题，但提交代码需要换回文件本来的缩进样式，试试看能不能改 --- 已经完成调查
	目前项目的代码规范大多使用的是空格缩进，但是目前在项目的package.json里发现了pritter配置usetab:true的情况这个情况会导致所有我触摸过的代码都统一变成tab缩进，这样的话会造成pr审核灾难，需要提出问题了解要不要统一规范还是去掉。
	这边表示前端代码都我来负责，代码风格我自己看着来就好了
5.了解并学习 Nextjs 15新版本特性以及NextAuth 5.0的使用
	1.现在的next 15 已经全面升级成了AppRouter
	2.Approuter 已经完全区别于之前的pagesRouter
	3.AppRouter如果实现ssr或者ssg可以不用写getServerProps这样的麻烦的东西了，因为目前next15的静态页实现方式有点类似于以前的ASP.net或者jsp,一部分代码可以在服务器上直接运行渲染 html字符串，另一部分代码可以通过"use client"来确定其为客户端组件，nextjs除了会在加载时渲染一次"use client"组件以外，也将会把它发送到客户端使其在hydration时再动态构造出来。这比原来的mvc框架好的是1.同构，语言一致，可灵活切换ssr/csr. 2.可灵活控制页面上哪些组件是客户端动态实例化的组件，哪些是服务端（默认服务端）渲染的组件。
	4.所以可以理解为appRouter默认就是在服务端运行的。运行一遍生成了具体的html标签文本再发送到客户端上去渲染具体的界面。
	5.approuter不同于pagesRouter的点在于：approuter的书写方式由原来的 pages/具体页面.tsx 变成了 app/具体页面/page.tsx。 还有api(纯后端代码)也放在了app/目录下。如果app/目录中出现app/(main)目录，意味着main文件夹下的所有路由将映射到根目录，用于在开发环境（代码）里区分不同业务的代码放置，避免造成文件管理混乱，例如可以创建 (userCenter) 这样的路由组，里面放用户中心的代码，但是在浏览器进行路由时，不需要带上userCenter这样的路径,路由组 ≈ 命名空间 + 布局作用域。
	6.nextAuth 5的好处是
		6.1 不需要再自己造轮子写鉴权/守卫以及sassion的前后端逻辑了。
		6.2 有更多的符合nextAuth Api标准的第三方平台的接入provider(可以理解为插件)，直接接入并配置一下就可以使用，前端方便接入三方平台的登录接口后端方便进行校验。
6.新建一个next15项目，并了解：
	1.如何使用新的appRouter完成服务端渲染页面，和“use client”页面的具体区别
		1.server组件不可以直接useContext,以及任何use之类的钩子都不能使用,server组件可以完成一些基础的数据拉取，并传入组件中作为初始化数据。
		2.server组件可以给子组件包裹ContextProvider,前提是Context代码不能和server组件粘在一起,可以做一个单独的provider函数式组件
	2.了解nextAuth具体的配置过程以及如何美化界面，增加验证码，接入数据库

明天的任务:
1.了解并学习:Radix UI  Tailwind CSS
2.了解并学习:Zustand  React Query