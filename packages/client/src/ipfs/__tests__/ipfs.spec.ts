import IPFSClient from "..";
import { IPFSClientConfig } from "../../types";

// Mock axios and fetch globally
jest.mock('axios');
global.fetch = jest.fn();

describe('IPFSClient', () => {
    let ipfsClientConfig: IPFSClientConfig;
    let ipfsClient: IPFSClient;

    beforeEach(() => {
        ipfsClientConfig = { apiKey: 'apiKey', baseUrl: 'baseUrl' };
        ipfsClient = new IPFSClient(ipfsClientConfig);
    });

    describe('post', () => {
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
            // Mock fetch to return a rejected promise with HTTP error 401
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

            // Arrange
            const data = 'someData';
            // Set ipfsClient's ipfs property to null to simulate an uninitialized state
            ipfsClient.ipfs = null;
        
            // Act & Assert
            await expect(ipfsClient.post(data)).rejects.toThrow('IPFS client not initialised properly');
        });
        
    });

    // Additional tests as needed...
});
