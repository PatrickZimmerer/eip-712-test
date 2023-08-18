import {
	useAccount,
	useConnect,
	useDisconnect,
	useBalance,
	useEnsAvatar,
	useEnsName,
	WagmiConfig,
	createConfig,
	configureChains,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

import 'bootstrap/dist/css/bootstrap.min.css'; // import Bootstrap CSS
import { goerli } from '@wagmi/chains';

console.log('key is', process.env.REACT_APP_GOERLI_API_KEY);
const { chains, publicClient } = configureChains(
	[goerli],
	[alchemyProvider({ apiKey: process.env.REACT_APP_GOERLI_API_KEY }), publicProvider()]
);

const configuration = createConfig({
	autoConnect: true,
	publicClient,
	connectors: [new MetaMaskConnector({ chains })],
});

export function Profile() {
	const { address, connector, isConnected } = useAccount();
	const { data: ensAvatar } = useEnsAvatar({ address });
	const { data: ensName } = useEnsName({ address });
	const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
	const { disconnect } = useDisconnect();
	const { data, balanceIsError, balanceIsLoading } = useBalance({
		address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
	});

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

function App() {
	return (
		<WagmiConfig config={configuration}>
			<Profile />
		</WagmiConfig>
	);
}

export default App;
