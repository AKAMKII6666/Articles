廖力工作日志 2025-12-11
今天的任务:
1.从2.0分支里拉取一个我的工作分枝，并将我做的修改分枝合并进去。
	已经完成
	但是发现两个问题:
	1.gloabl.css中新增了大量的业务代码，需要询问时上面情况
	2.gloabl.css中新增的业务代码看着像是“视频编辑”后头了解一下这个模块是不是有别的人在负责

2.正式开始新界面的重构工作
	1.把欢迎界面重构好
		完成一个按钮btn组件
		完成一个textArea组件
		完成一个发送按钮组件
		完成切换模式组件 -- 并调优样式
		完成下拉框组件的编写
		完成tooltip组件的编写
		完成下拉框组件selectItem的编写
		新增多个icon为模式选择提供图标

	2.把工作台聊天主界面重构好
		延后



长期任务:
1.大概梳理一下现有接口和新需求接口的对齐度 -- 把界面重构完就做这个
2.把现有的工作台的功能和业务理通 -- 把界面重构完就做这个
3.修复主界面的边栏收起 --  把界面重构完就做这个
4.适配一个移动端版本

设计稿规格为:1440*900
	需要重构的页面数量：
	1.工作台初始界面
		1.1.工作台初始界面聊天对话框 -- 聊天对话框中多个样式看起来有冲突，需要找产品经理询问
		1.2.重新整理一个多选下拉框组件
	2.工作台主界面
		2.1 工作台主界面左边聊天序列
		2.2 工作台主界面中间文件选择
		2.3 工作台主界面右边脚本编辑界面
			2.3.1 镜头列表编辑组件
			2.3.2 画面描述ai对话框
		2.4 工作台主界面右边视频编辑界面
			2.4.1 单选框列表组件
			2.4.2 点状分页
			2.4.3 支持宽/窄 两种视图模式

		2.5 工作台主界面右边影片编辑界面
		--明天让产品讲一下这个界面的设计和想法

当前计划是先快速重构静态页面，不要关心组件化的问题，
把业务模块用静态也重构的方式先快速过一遍，之后又结构
上的问题还能留下考虑时间及时更改

明天的任务:
1.把工作台聊天主界面重构好 - 并使其可以通用
2.添加下拉框组件
3.给iconbutton添加关闭的功能
4.写一个下拉框组件
5.将主界面的打开逻辑做出来，并最好能用上slash
6.编写主界面





@textArea.tsx 帮忙在这里实现一个textArea文本框
	
	范式要求
	依照chadcn/ui的范式编写
	不要编写类似 isEnabled && (<div>...</div>) 这种代码
	应该写成 (function(){ if(isEnabled === true){ return (<div>...</div>)}return null; })()
	不要写三元表达式
	判断空必须这样写 if(typeof value !== 'undefined' && value !== null){}
	不能写作 if(!value){} 这种判断非常模糊
	
	样式要求(所有像素高度转换成 rem 以16px字体为基础进行转换)
	初始高度为20px
	默认就是一行字所以默认行高为20px
	输入框背景色为var(--color-bg-surface)
	placeholder颜色为var(--color-text-muted)
	正文颜色为var(--color-text-ai)
	placeholder默认为"请输入内容"

	行为
	当用户输入的文字大于一行时，行高设为自动适应高度
	当用户输入的文字大于一行时，文本框高度随文字内容自适应高度
	当用户输入的文字小于一行时，行高设为20px
	当用户输入的文字为空时，行高设为20px
	当用户输入的文字为空时，placeholder显示"请输入内容"

	输入参数:
	value: 
	onChange: 
	onKeyDown:
	onFocus:
	onBlur:






	我看到了你给出的组件的使用方式
	看起来非常复杂且充满了冗余代码
	我希望实现一个tooltip组件，这样的组件使用时类似于mui提供的tioolTip组件:
	import Tooltip from "../../tooltip"

	使用就这么使用就行:
	<Tooltip title="点击查看详情"  >
		<span>查看详情</span>
	</Tooltip>
	你可以帮忙在这里实现一个tooltip吗

	范式要求
	依照chadcn/ui的范式编写
	不要编写类似 isEnabled && (<div>...</div>) 这种代码
	应该写成 (function(){ if(isEnabled === true){ return (<div>...</div>)}return null; })()
	不要写三元表达式
	判断空必须这样写 if(typeof value !== 'undefined' && value !== null){}
	不能写作 if(!value){} 这种判断非常模糊
	编写匿名函数时尽量不要使用肩头函数，应该使用(function(){  })()

	样式要求(所有像素高度转换成 rem 以16px字体为基础进行转换)
	高度 22px
	行高 22px
	字体大小 16px
	默认文字颜色 var(--color-button-primary-fg)
	默认背景颜色 var(--color-brand-accent)
	默认和children元素的距离 10px
	默认的border-radius 为 8px

	行为
	鼠标放到children中时显示tooltip 离开时tooltip消失
	显示和消失时淡入淡出

	输入参数:
	children
	//tooltip这一边应该出现在children上的左边还是右边
	position-x: left | right
	//tooltip这一边应该出现在children上的上面还是下面
	position-y: top | bottom

	//tooltip这一边应该挂在children上的左边缘还是右边缘
	attch-x: left | right
	//tooltip这一边应该挂在children上的上边缘还是下边缘
	attch-y: top | bottom

	className
	





我需要实现一个下拉框组件
这个组件可以套在任意组件上
点击后打开
使用起来像这样 ：
	//用“dropdownList”包围目标触发组件
	<dropdownList
		title="选择"
		value={"2"}
		items={
			[
				{
					value:"1"
					name:"功能1"
					iconName:"xxxx"
				},
				{
					value:"2"
					name:"功能1"
					iconName:"xxxx"
				}
			]
		}

		onChange={function(value){
			//更改值处理
		}}
	>
		//目标触发组件
		<div>点击选择</div>
	</dropDownList>

我希望这个里面大概是这样

return (
	//这是背景层 zindex = 1
	<div className="..." ></div>
	//这是弹出层 zindex=2
	<div className="..." >
		<div className="..." >{title}</div>
	</div>
	//下面渲染checkItem组件
	{items.map(function(index,item){
		return  <CheckItem key={index} {...item} isSelected={...} /> 
	})}
)

这是checkItem组件的使用方式:
<CheckItem
	value="taskMode"
	name="任务模式"
	iconName="commandKeyIcon"
	isChecked={false}
	disabled={true}
	onClick={function (
		event: React.MouseEvent<HTMLDivElement>,
		value: string
	) {
		console.log(value);
	}}
/>

	范式要求
		依照chadcn/ui的范式编写
		不要编写类似 isEnabled && (<div>...</div>) 这种代码
		应该写成 (function(){ if(isEnabled === true){ return (<div>...</div>)}return null; })()
		不要写三元表达式
		判断空必须这样写 if(typeof value !== 'undefined' && value !== null){}
		不能写作 if(!value){} 这种判断非常模糊
		编写匿名函数时尽量不要使用肩头函数，应该使用(function(){  })()
		请在编写参数的interface中写好注释，调用时可以看到

	样式要求(所有像素高度转换成 rem 以16px字体为基础进行转换)(所有下面说明的样式尽量使用tw格式编写)
		高度为 自动
		宽度为 自动
		默认背景颜色为 var(--color-bg-dropDown)
		padding:4
		box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.3);
		border-radius: 8px;
		组件内容分为三个部分
			1.标题
				padding-left:4px
				height:20px
				line-height:20px
				font-size:10px;
				color:--color-text-muted
			2.CheckItem列表
				间隔 4px
	
	行为
		点击锚定元素时显示
		显示在锚定元素的下方
		如果下拉框显示在锚定元素下方时超过当前显示范围就显示在锚定元素的上方
		点击某个CheckItem后 使用onChange函数告诉父级当前选中的id是哪个
	
	参数:
		title
		value
		items
		onChange
		distance (距离锚定元素多远 默认10px)




	我需要一个CheckItem组件:
	范式要求
		依照chadcn/ui的范式编写
		不要编写类似 isEnabled && (<div>...</div>) 这种代码
		应该写成 (function(){ if(isEnabled === true){ return (<div>...</div>)}return null; })()
		不要写三元表达式
		判断空必须这样写 if(typeof value !== 'undefined' && value !== null){}
		不能写作 if(!value){} 这种判断非常模糊
		编写匿名函数时尽量不要使用肩头函数，应该使用(function(){  })()
		请在编写参数的interface中写好注释，调用时可以看到

	样式要求(所有像素高度转换成 rem 以16px字体为基础进行转换)(所有下面说明的样式尽量使用tw格式编写)
		高度为 24px
		行高为 24px
		默认背景颜色为 透明
		选中时背景为 var(--color-brand-accent)
		容器的padding为  上下2px 左边6px 右边10px
		border-radius: 4px;
		组件内容分为三个部分
			1.图标(Icon组件)
				10px * 10px
			2.文字 
				字体颜色为 var(--color-text-inverse)
				字体大小 14px
			3.是否选中的那个勾勾
				图片为:../../../startPage/images/checkIcon.svg 图片大小为 9.9px * 7.01px
				请使用div + 背景的方式设置图片，不要用image
				未选中时不显示它（opacity:0）但要占位
	行为
		可点击
	
	参数
		value:string
		name:string
		iconName:string
		isChecked:boolean

	
