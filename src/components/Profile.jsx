import {
	useAccount,
	useConnect,
	useDisconnect,
	// useBalance,
	// useContractRead,
	useEnsName,
	useSignTypedData,
	useContractWrite,
} from 'wagmi';
import { goerli } from '@wagmi/chains';
import { BigNumber, ethers } from 'ethers';

import 'bootstrap/dist/css/bootstrap.min.css'; // import Bootstrap CSS
import { ERC20PermitAbi } from '../ERC-20Abi';

export function Profile() {
	let r;
	let s;
	let v;
	const contractAddress = '0xD35BFAb254f603adA28f21405447f82BBcCCD539';
	const spenderAddress = '0x98697033803CEf8bdDB7CA883786CfA9a96F2Be4';
	const { address, connector, isConnected } = useAccount();
	const { data: ensName } = useEnsName({ address });
	const { connect, connectors, error, connectorIsLoading, pendingConnector } = useConnect();
	const { disconnect } = useDisconnect();

	// async function getSignatureSplit() {
	// 	let signature = await signer.provider.send('eth_signTypedData_v4', [
	// 		address,
	// 		JSON.stringify(typedData),
	// 	]);
	// 	const split = ethers.utils.splitSignature(signature);

	// 	console.log('r: ', split.r);
	// 	console.log('s: ', split.s);
	// 	console.log('v: ', split.v);
	// }

	// testing out useBalance hook from wagmi
	// const { data, balanceIsError, balanceIsLoading } = useBalance({
	// 	address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
	// });

	//testing out reading from contract with wagmi
	// const contractRead = useContractRead({
	// 	address: contractAddress,
	// 	abi: ERC20PermitAbi,
	// 	functionName: 'allowance',
	// 	args: [
	// 		'0xe4064d8E292DCD971514972415664765e51B5364',
	// 		'0x98697033803CEf8bdDB7CA883786CfA9a96F2Be4',
	// 	],
	// });
	// console.log(contractRead);

	// testing typed data / EIP-712 with the help of useSignTypedData hook from wagmi
	const domain = {
		name: 'PZ',
		version: '1',
		chainId: goerli.id,
		verifyingContract: contractAddress,
	};
	const types = {
		EIP712Domain: [
			{ name: 'name', type: 'string' },
			{ name: 'version', type: 'string' },
			{ name: 'chainId', type: 'uint256' },
			{ name: 'verifyingContract', type: 'address' },
		],
		Permit: [
			{ name: 'owner', type: 'address' },
			{ name: 'spender', type: 'address' },
			{ name: 'value', type: 'uint256' },
			{ name: 'deadline', type: 'uint256' },
		],
	};

	const message = {
		owner: address,
		spender: spenderAddress,
		value: 133742069,
		deadline: +new Date() + 420 * 69,
	};

	const { dataSigned, isErrorSigned, isLoadingSigned, isSuccessSigned, signTypedData } =
		useSignTypedData({
			domain,
			message,
			primaryType: 'Permit',
			types,
		});

	// const getSignature = async () => {
	// 	let signature = await ethers.provider.send('eth_getBalance', [address]);
	// 	const split = ethers.utils.splitSignature(signature);

	// 	console.log('r: ', split.r);
	// 	console.log('r: ', split.r);
	// 	r = split.r;
	// 	console.log('s: ', split.s);
	// 	s = split.s;
	// 	console.log('v: ', split.v);
	// 	v = split.v;
	// };
	const signMessage = async () => {
		const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;

		const provider = ethers.getDefaultProvider(process.env.REACT_APP_GOERLI_HTTP_URL);

		const signer = new ethers.Wallet(PRIVATE_KEY, provider);
		console.log('signer', signer);

		const contract = new ethers.Contract(contractAddress, ERC20PermitAbi, signer);
		console.log('contract', contract);

		const transaction = await contract.permit(
			address,
			spenderAddress,
			BigNumber.from(133742069),
			BigNumber.from(+new Date() + 420 * 69),
			v,
			r,
			s
		);
		await transaction.wait();
		// if (transactionReceipt.status !== 1) {
		// 	alert('error message');
		// 	return;
		// }
		// await window.ethereum.send('eth_requestAccounts');
		//  provider = new ethers.providers.Web3Provider(window.ethereum);
		// const signer = provider.getSigner();
		// const signature = await signer.signMessage('message');
		// const split = ethers.utils.splitSignature(signature);

		// console.log('r: ', split.r);
		// console.log('s: ', split.s);
		// console.log('v: ', split.v);
		// r = split.r;
		// s = split.s;
		// v = split.v;
	};

	const { data, isLoading, isSuccess, write } = useContractWrite({
		address: contractAddress,
		abi: ERC20PermitAbi,
		functionName: 'permit',
	});

	// if (balanceIsLoading) return <div>Fetching balance…</div>;
	// if (balanceIsError) return <div>Error fetching balance</div>;

	if (isConnected) {
		return (
			<div className="d-flex flex-column justify-content-center align-items-center vh-100">
				<div className="d-flex py-2">
					<button onClick={() => signTypedData()} className="mx-2 btn btn-success">
						Permit with EIP-712 signed Data
					</button>
					<button onClick={() => signMessage()} className="mx-2 btn btn-danger">
						Permit without EIP-712
					</button>
				</div>
				<div className="py-2">
					{isLoading && <div>Check Wallet</div>}
					{isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
				</div>

				<div className="py-2">Address: {ensName ? `${ensName} (${address})` : address}</div>
				<div className="py-2">Connected with: {connector?.name}</div>
				{/* <div className="py-2">
					Balance: {data?.formatted} {data?.symbol}
				</div> */}
				<button className="mt-4 btn btn-primary" onClick={disconnect}>
					Disconnect
				</button>
			</div>
		);
	}
	return (
		<div className="d-flex flex-column justify-content-center align-items-center vh-100">
			{connectors.map((connector) => (
				<button
					className="btn btn-primary"
					disabled={!connector.ready}
					key={connector.id}
					onClick={() => connect({ connector })}
				>
					Connect
					{!connector.ready && ' (unsupported)'}
					{connectorIsLoading && connector.id === pendingConnector?.id && ' (connecting)'}
				</button>
			))}

			{error && <div>{error.message}</div>}
		</div>
	);
}
