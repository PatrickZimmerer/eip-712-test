import {
	useAccount,
	useConnect,
	useDisconnect,
	useBalance,
	useContractRead,
	useEnsName,
} from 'wagmi';

import 'bootstrap/dist/css/bootstrap.min.css'; // import Bootstrap CSS
import { ERC20PermitAbi } from '../ERC-20Abi';

export function Profile() {
	const contractAddr = '0xD35BFAb254f603adA28f21405447f82BBcCCD539';
	const { address, connector, isConnected } = useAccount();
	const { data: ensName } = useEnsName({ address });
	const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
	const { disconnect } = useDisconnect();
	const { data, balanceIsError, balanceIsLoading } = useBalance({
		address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
	});

	const contractRead = useContractRead({
		address: contractAddr,
		abi: ERC20PermitAbi,
		functionName: 'allowance',
		args: [
			'0xe4064d8E292DCD971514972415664765e51B5364',
			'0x98697033803CEf8bdDB7CA883786CfA9a96F2Be4',
		],
	});
	console.log(contractRead);

	if (balanceIsLoading) return <div>Fetching balance…</div>;
	if (balanceIsError) return <div>Error fetching balance</div>;

	if (isConnected) {
		return (
			<div className="d-flex flex-column justify-content-center align-items-center vh-100">
				<div className="py-2">Address: {ensName ? `${ensName} (${address})` : address}</div>
				<div className="py-2">Connected with: {connector?.name}</div>
				<div className="py-2">
					Balance: {data?.formatted} {data?.symbol}
				</div>
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
					{connector.name}
					{!connector.ready && ' (unsupported)'}
					{isLoading && connector.id === pendingConnector?.id && ' (connecting)'}
				</button>
			))}

			{error && <div>{error.message}</div>}
		</div>
	);
}
