廖力工作日志 2025-12-05
今天的任务:
1.完成一个完整的shadcn/ui组件
	1.cva的理解（变体工厂）：
		1.cva通过传入组件的样式配置来生成一个变体器函数（柯里化）。
		2.在样式需要真正落实到组件上时，调用变体器函数，传入当前客制化样式配置，让变体器输出【配置->客制化】之后的样式表组合
		3.cva中存在两种参数，一个是恒定样式，用于说明当前元素的不可变样式，一个是可配置样式，即variants和defautVariants。
		4.variants配置用于说明有多少种变体选项可供选择，每个变体的具体样式是什么，defautVariants说明variants配置中所涉及到可变参数的默认值应该是什么。

		注意:
		cva 更适合作为「单个可复用 UI 元素」的变体工厂，而不是所有组件都上来就搞一套 variants。
		对于复杂窗口 / 业务组件，很多时候直接写 Tailwind 就够了

		如果是 Button / Tag / Alert / Badge / Input / IconButton 这种 → ✅ 很适合用 cva。

		如果是 Dialog / Drawer / Navbar / Layout / FormPage 这种 → ❌ 不要上来就 cva 化。
	2.cn(样式合并工具函数)的理解
		1.帮助将不友好的样式"+"字符串拼接，在代码视觉上转变成参数数组，更利于代码阅读。
		2.可用于去重和归并同类样式，如果一行样式里有多个同样的样式，就会使其留下最后一个有效样式，减少浏览器的cssom树的解析压力。
		3.用于多格式样式合并，可支持接受数组，对象，参数数组。输出时最终为样式字符串。

	已经完成了一个完整的组件

	3.完成一个系统内置尺寸系统枚举组件
		要求：
		1.枚举所有tw里的硬编码
		2.在枚举的同时使用黑色方块表示展示的尺寸大小
		3.在展示黑色方块的尺寸大小的时候，需要真实获取当前尺寸的大小（考虑到系统内可能通过自定义css更改，所以一定要反应系统内变量的真实状态）
		4.顶部需要一个查询框，用于输入类似 "p-4"这样的硬编码值，然后帮助在尺寸枚举列表里找到对应的项目
		5.枚举列表中一定要标注某个尺寸表示的真实大小例如p-4 = xxxrem

2.学习使用 Zustand  React Query
	1.Zustand 就是个简化版本的redux
		使用很简单，就是定义一个store,在create()的时候,定义初始值和可使用函数，在函数里使用或设置状态就直接get(),set()就好了。
		不需要provider,默认全局可用。
		在要使用的地方直接调用create导出的那个对象，并像redux的seleter一样监听单个状态或者拿出某个函数就行了。
		是一个非常好用简单易上手的单例模式组件

		坑点:
			React 19 / Next 15 不能这样获取状态:
				const ss_loginInfo = useSessionInfo((state) => ({
					id: state.id,
					name: state.name,
					email: state.email,
					hasLogin: state.hasLogin,
				}));
			需要像这样获取:
			const id = useSessionInfo((s) => s.id);
			const name = useSessionInfo((s) => s.name);
			const email = useSessionInfo((s) => s.email);
			const hasLogin = useSessionInfo((s) => s.hasLogin);
	
	2. ReactQuery的使用
		useQuery概念理解：
		1.ReactQuery专门用于处理服务器数据获取后的状态托管。
		2.本意是通过一套机制将服务器上拉取下来的数据进行：缓存，刷新，轮询等处理。这是useQuery的参数:useQuery({
			queryKey: [缓存id,其它参数],
			queryFn: [请求接口的函数],
		})
		3.可以在多个文件写同样的useQuery(一样的参数)，这样的写法也不会造成多次重复请求，因为useQuery有一套根据缓存id来进行缓存的机制，只要在一定条件下（缓存过期时间，缓存id）,它不会真的去服务器上拿数据，而是从缓存里拿上一次请求成功的数据。
		4.缓存方面，它是通过缓存id来存春和命中数据缓存的，缓存id的话有两个参数，第一个参数可以理解成当前接口请求的名称（自定义），第二个参数可以是number,用来表示某个接口的slash参数。或者是一个json对象，用来表示查询这个接口时更复杂的参数结构。
		5.useQuery会返回三个变量，data,isloading,error,refetch.
		6.可以配置polling也就是轮询，以及配置轮询时间，轮询暂停还是开始等策略。

		useMutation概念理解:
		1.useMutation用于托管状态更新，它的作用大概是，调用Mutate(传入参数) -> 使用具体的fetch/axion/ajax组件完成数据更新 -> 通知reactQuery状态缓存机将相关缓存丢弃方便下次访问数据时直接从服务器上拿取数据。
		2.关键钩子:useMutation, useQueryClient.
		3.useMutation({mutationFn,onSuccess}) mutationFn为具体的ajax请求的位置,onSuccess为成功执行mutationFn以后会被调用的函数，在这里面使用useQueryClient导出的queryClient.invalidateQueries来将相关缓存设置为失效：queryClient.invalidateQueries({ queryKey: ["缓存id"] });
		4.useMutation将导出这几个东西mutate, isPending, error
		5.mutate 就是用来击发 mutationFn的。mutate(这里的任何参数)将直接传到mutationFn(的这个里面)。
		6.isPending用来处理当前更新的状态
		7.error处理错误。
		


3.学习使用 Socket.io
4.学习使用 Zod


明天的任务:
1.全面了解当前业务流程
2.全面扫描一遍当前业务代码里的问题
3.对问题进行分析并得出解决方案
4.评估解决时间
5.了解新需求的内容
