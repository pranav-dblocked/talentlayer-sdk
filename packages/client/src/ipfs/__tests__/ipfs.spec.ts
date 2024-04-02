import IPFSClient from "..";
import { IPFSClientConfig } from "../../types";

// Mock fetch globally
global.fetch = jest.fn();

describe('IPFSClient', () => {
    let ipfsClientConfig: IPFSClientConfig;
    let ipfsClient: IPFSClient;

    beforeEach(async () => {
        ipfsClientConfig = { apiKey: 'apiKey', baseUrl: 'baseUrl', provider: 'quicknode' };
        ipfsClient = new IPFSClient(ipfsClientConfig);
    });

    describe('post for QuickNode', () => {
        test('should post data successfully', async () => {
            // Mock fetch to return a resolved promise with a successful response
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('0xracoon')
            });

            // Arrange
            const data = 'someData';

            // Act
            const result = await ipfsClient.post(data);

            // Assert
            expect(result).toEqual('0xracoon');
        });

        test('should throw an error if the IPFS client is not initialized', async () => {
            // Arrange
            const data = 'someData';
            // Set ipfsClient's ipfs property to null to simulate an uninitialized state
            ipfsClient.initialized = false;
        
            // Act & Assert
            await expect(ipfsClient.post(data)).rejects.toThrow('IPFS client not initialised properly');
        });
        
    });

    describe('post for Infura', () => {
        beforeEach(() => {
            ipfsClientConfig = { clientId: 'yourClientId', clientSecret: 'yourClientSecret', baseUrl: 'baseUrl', provider: 'infura' };
            ipfsClient = new IPFSClient(ipfsClientConfig);
        });

        test('should post data successfully', async () => {
            // Arrange
            const data = 'someData';

            // Act
            console.log(ipfsClient)
            const result = await ipfsClient.post(data);

            // Assert
            expect(result).toEqual('0xracoon');
        });

        test('should throw an error if the IPFS client is not initialized', async () => {
            // Arrange
            const data = 'someData';
            // Set ipfsClient's ipfs property to null to simulate an uninitialized state
            ipfsClient.initialized = false;
        
            // Act & Assert
            await expect(ipfsClient.post(data)).rejects.toThrow('IPFS client not initialised properly');
        });
        
    });

    // Additional tests as needed...
});
