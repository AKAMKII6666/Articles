const Web3 = window.Web3;

window.$ = jQuery;
const $ = jQuery;

//钱包地址
let currentAccount = "";
//钱包链
let currentChainId = "";

/**
 * 初始化系统
 */
let initSys = function () {
	//安装钱包按钮
	$("#installWallet_btn").click(function () {
		//这样来判断是否已经安装钱包
		if (window.hasOwnProperty("ethereum")) {
			alert("已经安装了钱包");
		} else {
			installWallet();
		}
	});

	//链接钱包按钮
	$("#linkWallet_btn").click(function () {
		if (!window.hasOwnProperty("ethereum")) {
			alert("还没安装钱包");
			installWallet();
		} else {
			connectToWallet();
		}
	});

	//切换网络
	$("#switchNetwork_btn").click(function () {
		if (!window.hasOwnProperty("ethereum")) {
			alert("还没安装钱包");
			installWallet();
		} else if (currentAccount === "") {
			alert("还没链接钱包");
			connectToWallet();
		} else {
			switchNetWork({
				//依赖的网络id
				depChainId: 97,
				//依赖的网络名称
				depChainName: "BSC Testnet",
				//web3链接节点的地址
				provider: "https://data-seed-prebsc-1-s1.binance.org:8545/",
				//web3链接节点的符号
				symbol: "BNB",
				//查询浏览器的访问地址
				visitUrl: "https://testnet.bscscan.com/",
				//小数位数
				decimals: 18,
			});
		}
	});

	//用web3js发起交易
	$("#makeTranx_btn").click(function () {
		if (!window.hasOwnProperty("ethereum")) {
			alert("还没安装钱包");
			installWallet();
		} else if (currentAccount === "") {
			alert("还没链接钱包");
			connectToWallet();
		} else {
			makeTranxwithWeb3();
		}
	});

	//已经安装钱包的就监听状态
	if (window.hasOwnProperty("ethereum")) {
		//监听钱包变更状态
		listenWalletState();
	}

	//监听ethereum是否安装
	window.addEventListener(
		"ethereum#initialized",
		function () {
			if (window.hasOwnProperty("ethereum")) {
				//监听钱包变更状态
				listenWalletState();
			}
		},
		{
			once: true,
		}
	);
};

$(document).ready(function () {
	initSys();
});

//获取交易手续费
let getGas = function () {
	return new Promise(function (_reslove) {
		let _web3 = new Web3(window.ethereum);
		_web3.eth.getGasPrice().then(function (_res) {
			let _result = { status: "", data: { price: 0, fastPrice: 0 } };
			/**
			 * gasprice是10位的
			 */
			var result = _res;
			_result.status = "ok";
			_result.data = {
				price: result,
				fastPrice: new window.BigNumber((Number(result) * 12) / 10).toFixed(0),
			};
			if (typeof _callBack !== "undefined") {
				_callBack(_result);
			}
			_reslove(_result);
		});
	});
};

//用web3js发起钱包对钱包的交易
let makeTranxwithWeb3 = async function () {
	let _web3 = new Web3(window.ethereum);

	const fromAddress = currentAccount; // 发送方钱包地址
	const toAddress = $("#text_account_target").val(); // 接收方钱包地址
	const amountInWei = _web3.utils.toWei($("#text_point").val(), "ether"); // 0.1 BNB

	let gas = await getGas();
	// 构建交易对象
	const txObject = {
		from: fromAddress,
		to: toAddress,
		value: amountInWei,
		gasPrice: gas.data.fastPrice, // BSC 网络的标准 gas 数量
	};

	// 发送交易
	_web3.eth
		.sendTransaction(txObject)
		.on("transactionHash", function (hash) {
			console.log("Transaction hash:", hash);
		})
		.on("receipt", function (receipt) {
			console.log("Transaction receipt:", receipt);
		})
		.on("error", function (error) {
			console.log("Error sending BNB:", error);
		})
		.then(function () {
			alert("交易完成!");
		});
};

//渲染页面信息
let drawInfo = function () {
	$("#walletAddress").html(currentAccount);
	$("#walletchainId").html(currentChainId);
};

//安装钱包
let installWallet = function () {
	//这样来安装钱包
	var onboarding = new window.metamaskonboarding();
	onboarding.startOnboarding();
};

//链接钱包
let connectToWallet = async function () {
	let _ethereum = window.ethereum;
	//链接钱包并拿到钱包地址
	let result = await _ethereum.request({
		method: "eth_requestAccounts",
	});
	currentAccount = result[0];
	//拿到链id
	let chainId = await _ethereum.request({ method: "eth_chainId" });
	currentChainId = chainId;
	//显示信息
	drawInfo();
};

//监听钱包状态
let listenWalletState = function () {
	let _ethereum = window.ethereum;
	//注册账号变更事件
	_ethereum["on"]("accountsChanged", function (_accounts) {
		//万一没有那就是断开链接了
		if (_accounts.length === 0) {
			currentAccount = "";
			drawInfo();
			return;
		}
		currentAccount = _accounts[0];
		drawInfo();
	});
	//注册网络变更事件
	_ethereum["on"]("chainChanged", function (_chainId) {
		currentChainId = _chainId;
		drawInfo();
	});
};

/**
 * 添加网络
 */
let addNetWork = async function (_netWork) {
	var result = {
		status: "error",
		data: {},
	};
	return new Promise((resolve, reject) => {
		if (typeof window["ethereum"] === "undefined") {
			resolve(result);
			return;
		}
		var chainid = "0x" + Number(_netWork.depChainId).toString(16).toLowerCase();

		return window.ethereum
			.request({
				method: "wallet_addEthereumChain",
				params: [
					{
						chainId: chainid,
						rpcUrls: [_netWork.provider],
						chainName: _netWork.depChainName,
						nativeCurrency: {
							name: _netWork.depChainName,
							symbol: _netWork.symbol,
							decimals: _netWork.decimals,
						},
						blockExplorerUrls: [_netWork.visitUrl],
					},
				],
			})
			.then(
				function (_data) {
					result.status = ResultStateus.SUCCESSED;
					resolve(result);
				},
				function (_data) {
					result.status = ResultStateus.USEREXIT;
					result.data = _data;
					resolve(result);
				}
			)
			.catch(function (_e) {
				result.data = _e;
				resolve(result);
			});
	});
};

/**
 * 切换网络
 */
let switchNetWork = function (_netWork) {
	var result = {
		status: "error",
		data: {},
	};

	return new Promise((resolve, reject) => {
		if (typeof window["ethereum"] === "undefined") {
			resolve(result);
			return;
		}
		debugger;
		if (currentChainId !== _netWork.depChainId.toString()) {
			return window.ethereum
				.request({
					method: "wallet_switchEthereumChain",
					params: [
						{
							chainId: "0x" + Number(_netWork.depChainId).toString(16).toLowerCase(),
						},
					], // chainId must be in hexadecimal numbers
				})
				.then(
					function (_data) {
						result.status = "successed";
						resolve(result);
					},
					async function (_data) {
						result.status = "userexit";
						resolve(await addNetWork(_netWork));
					}
				)
				.catch(async function (_e) {
					resolve(await addNetWork(_netWork));
				});
		}
	});
};
