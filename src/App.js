import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { ethers } from 'ethers';

import { goerli } from '@wagmi/chains';
import { Profile } from './components/Profile';

import 'bootstrap/dist/css/bootstrap.min.css'; // import Bootstrap CSS

const { chains, publicClient } = configureChains(
	[goerli],
	[alchemyProvider({ apiKey: process.env.REACT_APP_GOERLI_API_KEY }), publicProvider()]
);

const configuration = createConfig({
	autoConnect: true,
	publicClient,
	connectors: [new MetaMaskConnector({ chains })],
});

function App() {
	return (
		<WagmiConfig config={configuration}>
			<Profile />
		</WagmiConfig>
	);
}

export default App;
