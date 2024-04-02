// Mocked Kubo RPC Client
const create = jest.fn(config => {
    // Mocked IPFS client instance
    const ipfs = {
        add: jest.fn(data => Promise.resolve({ path: '0xracoon' })), // Return '0xracoon' instead of the original data
        pin: {
            add: jest.fn(path => Promise.resolve(`Pin successful for ${path}`))
        }
    };

    return ipfs;
});

module.exports = { create };
