廖力工作日志 2025-12-04
今天的任务:
1.完成nextAuth v5的初步学习
	问题:
	1.我在用户中心编写了signOut()  但是控制台报错:`headers` was called outside a request scope. Read more: 是不是在layout页需要放一个nextAuth v5的状态provider?
		//客户端统一使用这个signOut
		import { signOut } from "next-auth/react";

		//在服务器端才使用
		import { signOut } from "@/lib/auth";

		登出时不需要sessionProvider,除非要获取登录信息，比如用户名什么的。


	2.lib下写的auth配置文件是不是可供三端运行，一端是中间件，一端是服务器，一端是客户端?
		不是三端运行，是两端:
			服务器端：使用 @/lib/auth 导出的函数
			中间件:使用 @/lib/auth 导出的函数
			(中间件：在请求到达页面之前执行)

			客户端：使用 next-auth/react 导出的函数

	3.lib下写的auth配置文件我是不是可以理解nextAuth就是想把中间件的路由守卫配置，和后弹鉴权逻辑，以及前端登录登出鉴权逻辑都集中在一个位置管理，由不同地方使用，这样的话状态判断就好用？
	确实如此，但是客户端是使用 next-auth/react 导出的函数进行状态管理的，不像服务器端直接使用@/lib/auth做的配置

	4.我登录后没看到localsotrage或者cookie中有任何token信息，默认是否内存保存token?
		因为：
		1.默认情况下auth.js(NextAuth)的cookie配置为http-only,也就是不会在开发者控制台中暴露cookie( 实际已经写入了cookie到本地硬盘里了 )，只需要在NextAuth的配置中配置如下项目即可开启cookie在开发者控制台中的可视性 :
		cookies: {
			sessionToken: {
				name: `authjs.session-token`,
				options: {
					httpOnly: false, //允许客户端脚本访问cookie 此配置为允许客户端脚本访问cookie
					sameSite: "lax", //跨域请求 允许携带cookie 此配置为允许所有域名携带cookie
					path: "/", //cookie路径 此配置为允许所有路径携带cookie
					secure: process.env.NODE_ENV === "production", //是否只允许https请求访问cookie 此配置为允许所有请求访问cookie
					maxAge: 30 * 24 * 60 * 60, //cookie过期时间 此配置为30天
				},
			},
		},

	细节提问：
	1.如果我希望显示用户的账号，我如何使用sessionProvider?
		需要做一个provider组件，然后包在layout中就好了
		然后在需要使用的子组件中使用：
		import { useSession } from "next-auth/react";
		const { data: session, status } = useSession();
		session?.user?.name
		就好了


	2.实际上nextAuth默认就认为站点和这个next后端是同域的对吧？就是根本不存在跨域登录的情况，实际上也不适用于多租户系统用户中心管理台那种设计架构，它只针对单站点单应用同域下登录的实现？
		不对，支持多租户可以进行配置。也支持跨域登录，可以配置解决，这个不深究了，因为目前用不到，现在只是好奇问一下。

	3.关于cookie设置，有几个细节问题：
		3.1 : sameSite: "lax"这个lax选项是指什么，它还有哪些可配置项
			用于配置同源策略（是否跨域，跨域的程度是什么）
			"strict"（最严格）
				任何跨站请求都不携带 Cookie
				即使是同站链接跳转也不携带
				安全性最高，但可能影响用户体验
			"lax"（默认推荐）
				同站请求：携带 Cookie
				跨站 GET 请求（如链接跳转）：携带 Cookie
				跨站 POST/表单提交：不携带 Cookie
				跨站 iframe/图片/脚本：不携带 Cookie
			"none"（跨域必需）
				所有跨站请求都携带 Cookie
				必须配合 secure: true（HTTPS）
				用于跨域场景


		3.2 : 我刚刚确实没有在浏览器控制台中看见cookie的出现，在打开httpOnly: false之后它就出现了，但是你说并不是，哪是不是别的配置影响了?
			这个问题cursor也不知道,我去问问gpt
			调查以后发现这个问题可能是我第一次没看到，经过几轮测试发现无论怎么配置都可以在控制台的cookie中看到相应的cookie,这没任何问题.

---------nextAuth初步学习完成---------

1.了解并学习:Radix UI  Tailwind CSS
	Radix UI 概念解析
	1.当说到Radix的时候，它包含三个概念（Radix 体系）：
		1.1.Radix Primitives:纯组原子件库，不包含样式，只有组件本身，可通过自由组装的方式快速获得自己想要的组件。
		1.2.Radix Themes:类似mui,在Radix Primitives的基础上封装了一层样式，直接提供一套现成的组件使用。
		1.3 shadcn/ui 一套CLI直接在项目里安装Radix Primitives + Tailwind CSS 并将一套现成组件拷贝到项目里来，源代码可见，可修改或自定义样式。优点是一些基础组件不需要自己去积累了，样式的话可根据项目需求客制化。
	2.一般项目里使用了Radix Themes应该就不会再考虑 shadcn/ui,反之亦然，因为这在项目的技术栈使用里应该是2选1的选项。两个都用应该也行，只是对于项目来说就比较混乱了。
	3.一些官方没有支持的组件例如datepicker或者dateRangePicker就需要使用antd或者mui等一些第三方组件库来封装解决。

	具体使用:
	具体使用的话需要经过这几个学习路径:
	1.学习tailwind css
	

目前项目中在使用tw时存在的一些问题：
1.虽然使用了shadcn/ui 但是在自定义组件中使用硬编码颜色比较多（60%），对于日后升级主题系统（双色切换）不利
2.项目的尺寸系统是硬编码的，可能在之后更新主题系统时造成阻碍，但目前不是很重要的问题。

	Radix Primitive学习：
	<Dialog.Root>
		<Dialog.Trigger>打开</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay />
			<Dialog.Content>
			<Dialog.Title>标题</Dialog.Title>
			<Dialog.Description>说明文字</Dialog.Description>
			<Dialog.Close>关闭</Dialog.Close>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>

	我的理解是这样的：
	Radix Primitive 实际上无任何样式，写好以后就是一滩瘫软的元素
	样式还是需要依靠tw系统来加成
	既然这样，那为什么使用它，它和原生标签有什么区别(div input)，为什么不直接使用原生标签：
	1.支持键盘操作
	2.集成基本的针对特定业务状态保持
	3.支持基本的无障碍特性，不需要另外开发
	4.可能需要一点学习成本，但是一旦学会就可以比原生代码更快/更不容易出事故地构建商用前端。

	shadcn/ui默认组件库的理解：
	shadcn/UI 我理解就是将redix Primitive中的元素拿出来使用装饰器模式做了个样式并导出，而不是封装成了现有的ui组件，这种方式是在方便自定义风格和快速构造业务代码之间做了个平衡。

明天的任务:
1.完成一个完整的shadcn/ui组件
2.学习使用 Zustand  React Query
3.学习使用 Socket.io
4.学习使用 Zod
