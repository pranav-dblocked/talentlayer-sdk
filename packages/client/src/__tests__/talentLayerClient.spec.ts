
import { ERC20 } from '../blockchain-bindings/erc20';
import { Disputes } from '../disputes';
import { Escrow } from '../escrow';
import { TalentLayerClient } from '../index';
import { Platform } from '../platform';
import { Profile } from '../profile';
import { Proposal } from '../proposals';
import { Review } from '../reviews';
import { Service } from '../services';
import { CustomConfig, NetworkEnum, IPFSClientConfig } from '../types';
import { testPlatformId } from '../__mocks__/fixtures';
import TalentLayerID from '../contracts/ABI/TalentLayerID.json';
import TalerLayerService from '../contracts/ABI/TalentLayerService.json';
import TalentLayerReview from '../contracts/ABI/TalentLayerReview.json';
import TalentLayerEscrow from '../contracts/ABI/TalentLayerEscrow.json';
import TalentLayerPlatformID from '../contracts/ABI/TalentLayerPlatformID.json';
import TalentLayerArbitrator from '../contracts/ABI/TalentLayerArbitrator.json';
import { getChainConfig } from '../config';



jest.mock('axios')
jest.mock('ipfs-http-client', () => ({
    create: jest.fn().mockImplementation(() => ({
        add: jest.fn().mockResolvedValue({ path: '0xracoon' }), // Mocking the add method of IPFS client
        pin: { add: jest.fn().mockResolvedValue({ path: '0xRacoon' }) }
    })),
}));

describe('TalentLayerClient', () => {
    let clientQuicknode: any;
    let clientInfura: any;

    beforeEach(() => {
        Object.defineProperty(globalThis, 'window', {
        });
        const chainId = 137;
        const quicknodeConfig: IPFSClientConfig = {
            provider: 'quicknode',
            apiKey: 'your_quicknode_api_key',
            baseUrl: 'www.quicknode.com'
        };
        const infuraConfig: IPFSClientConfig = {
            provider: 'infura',
            clientId: 'your_infura_client_id',
            clientSecret: 'your_infura_client_secret',
            baseUrl: 'https://ipfs.infura.io:5001/api/v0'
        };
        
        const viemConfig = {};
        const platformID = testPlatformId;
        const signatureApiUrl = 'www.example.com';
        
        clientQuicknode = new TalentLayerClient({
            chainId: chainId,
            ipfsConfig: quicknodeConfig,
            platformId: testPlatformId,
            signatureApiUrl: signatureApiUrl,
            debug: false
        });
        clientInfura = new TalentLayerClient({
            chainId: chainId,
            ipfsConfig: infuraConfig,
            platformId: testPlatformId,
            signatureApiUrl: signatureApiUrl,
            debug: false
        });


    })

    describe('constructor', () => {
        it('should be initialised successfully (Quicknode)', async () => {
            expect(clientQuicknode).toBeDefined()

        })

        it('should be initialised successfully (Infura)', async () => {
            expect(clientInfura).toBeDefined()

        })
    })

    describe('getters', () => {
        it('should return all domain specific getters  (Quicknode)', async () => {
            expect(clientQuicknode.platform).toBeInstanceOf(Platform)
            expect(clientQuicknode.erc20).toBeInstanceOf(ERC20)
            expect(clientQuicknode.proposal).toBeInstanceOf(Proposal)
            expect(clientQuicknode.disputes).toBeInstanceOf(Disputes)
            expect(clientQuicknode.service).toBeInstanceOf(Service)
            expect(clientQuicknode.profile).toBeInstanceOf(Profile)
            expect(clientQuicknode.escrow).toBeInstanceOf(Escrow)
            expect(clientQuicknode.review).toBeInstanceOf(Review)
        })
        it('should return all domain specific getters (Infura)', async () => {
            expect(clientInfura.platform).toBeInstanceOf(Platform)
            expect(clientInfura.erc20).toBeInstanceOf(ERC20)
            expect(clientInfura.proposal).toBeInstanceOf(Proposal)
            expect(clientInfura.disputes).toBeInstanceOf(Disputes)
            expect(clientInfura.service).toBeInstanceOf(Service)
            expect(clientInfura.profile).toBeInstanceOf(Profile)
            expect(clientInfura.escrow).toBeInstanceOf(Escrow)
            expect(clientInfura.review).toBeInstanceOf(Review)
        })
    })

    describe('getChainConfig', () => {
        it('should return the chain config based on the network id passed (Quicknode)', () => {
            // Arrange
            const networkId = NetworkEnum.MUMBAI

            // Act
            const config = clientQuicknode.getChainConfig(networkId);

            // Assert
            expect(config).toEqual(getChainConfig(networkId));
        })
        it('should return the chain config based on the network id passed (Infura)', () => {
            // Arrange
            const networkId = NetworkEnum.MUMBAI

            // Act
            const config = clientInfura.getChainConfig(networkId);

            // Assert
            expect(config).toEqual(getChainConfig(networkId));
        })
    })
});


describe('TalentLayerClient:dev', () => {
    let clientQuicknode: any;
    let clientInfura: any;

    beforeEach(() => {
        Object.defineProperty(globalThis, 'window', {
        });
        const chainId = 137;
        const quicknodeConfig: IPFSClientConfig = {
            provider: 'quicknode',
            apiKey: 'your_quicknode_api_key',
            baseUrl: 'www.quicknode.com'
        };
        const infuraConfig: IPFSClientConfig = {
            provider: 'infura',
            clientId: 'your_infura_client_id',
            clientSecret: 'your_infura_client_secret',
            baseUrl: 'https://ipfs.infura.io:5001/api/v0'
        };
        const viemConfig = {};
        const platformID = testPlatformId;
        const signatureApiUrl = 'www.example.com';
        const localNetworkId = NetworkEnum.LOCAL;
        const customConfig: CustomConfig = {
            chainConfig: {
                id: localNetworkId,
                name: 'local',
                network: 'local',
                nativeCurrency: {
                    name: 'racoon',
                    symbol: 'RCN',
                    decimals: 18
                },
                rpcUrls: {
                    default: {
                        http: ['http:localhost:1337']
                    },
                    public: {
                        http: ['http:localhost:1337']
                    }
                }



            },
            contractConfig: {
                networkId: localNetworkId,
                subgraphUrl: 'www.example.com',
                escrowConfig: {
                    adminFee: '0',
                    adminWallet: '0xC01FcDfDE3B2ABA1eab76731493C617FfAED2F10',
                    timeoutPayment: 3600 * 24 * 7,
                },
                tokens: {
                    '0x0000000000000000000000000000000000000000': {
                        address: '0x0000000000000000000000000000000000000000',
                        symbol: 'RLC',
                        name: 'iExec RLC',
                        decimals: 18,
                    },
                    '0xe62C28709E4F19Bae592a716b891A9B76bf897E4': {
                        address: '0xe62C28709E4F19Bae592a716b891A9B76bf897E4',
                        symbol: 'SERC20',
                        name: 'SimpleERC20',
                        decimals: 18,
                    },
                },
                contracts: {
                    talentLayerId: {
                        address: '0xC51537E03f56650C63A9Feca4cCb5a039c77c822',
                        abi: TalentLayerID.abi,
                    },
                    talentLayerService: {
                        address: '0x45E8F869Fd316741A9316f39bF09AD03Df88496f',
                        abi: TalerLayerService.abi,
                    },
                    talentLayerReview: {
                        address: '0x6A5BF452108DA389B7B38284E871f538671Ad375',
                        abi: TalentLayerReview.abi,
                    },
                    talentLayerEscrow: {
                        address: '0x7A534501a6e63448EBC691f27B27B76d4F9b7E17',
                        abi: TalentLayerEscrow.abi,
                    },
                    talentLayerPlatformId: {
                        address: '0x05D8A2E01EB06c284ECBae607A2d0c2BE946Bf49',
                        abi: TalentLayerPlatformID.abi,
                    },
                    talentLayerArbitrator: {
                        address: '0x24cEd045b50cF811862B1c33dC6B1fbC8358F521',
                        abi: TalentLayerArbitrator.abi,
                    },
                }
            }
        }

        clientQuicknode = new TalentLayerClient({
            chainId: chainId,
            ipfsConfig: quicknodeConfig,
            platformId: testPlatformId,
            signatureApiUrl: signatureApiUrl,
            customConfig: customConfig
        })
        clientInfura = new TalentLayerClient({
            chainId: chainId,
            ipfsConfig: infuraConfig,
            platformId: testPlatformId,
            signatureApiUrl: signatureApiUrl,
            customConfig: customConfig
        })
    })

    describe('constructor', () => {
        it('should be initialised successfully (Quicknode)', async () => {
            expect(clientQuicknode).toBeDefined()

        })
        it('should be initialised successfully (Infura)', async () => {
            expect(clientInfura).toBeDefined()

        })
    })

    describe('getters', () => {
        it('should return all domain specific getters (Quicknode)', async () => {
            expect(clientQuicknode.platform).toBeInstanceOf(Platform)
            expect(clientQuicknode.erc20).toBeInstanceOf(ERC20)
            expect(clientQuicknode.proposal).toBeInstanceOf(Proposal)
            expect(clientQuicknode.disputes).toBeInstanceOf(Disputes)
            expect(clientQuicknode.service).toBeInstanceOf(Service)
            expect(clientQuicknode.profile).toBeInstanceOf(Profile)
            expect(clientQuicknode.escrow).toBeInstanceOf(Escrow)
            expect(clientQuicknode.review).toBeInstanceOf(Review)
        })

        it('should return all domain specific getters (Infura)', async () => {
            expect(clientInfura.platform).toBeInstanceOf(Platform)
            expect(clientInfura.erc20).toBeInstanceOf(ERC20)
            expect(clientInfura.proposal).toBeInstanceOf(Proposal)
            expect(clientInfura.disputes).toBeInstanceOf(Disputes)
            expect(clientInfura.service).toBeInstanceOf(Service)
            expect(clientInfura.profile).toBeInstanceOf(Profile)
            expect(clientInfura.escrow).toBeInstanceOf(Escrow)
            expect(clientInfura.review).toBeInstanceOf(Review)
        })
    })

    describe('getChainConfig', () => {
        it('should return the chain config irrespective of the network id passed (Quicknode)', () => {
            // Arrange
            const networkId = NetworkEnum.MUMBAI

            // Act
            const config = clientQuicknode.getChainConfig(networkId);

            // Assert
            expect(config).toEqual(clientQuicknode.customConfig.contractConfig);
        })
        it('should return the chain config irrespective of the network id passed (Infura)', () => {
            // Arrange
            const networkId = NetworkEnum.MUMBAI

            // Act
            const config = clientInfura.getChainConfig(networkId);

            // Assert
            expect(config).toEqual(clientInfura.customConfig.contractConfig);
        })
    })
})
