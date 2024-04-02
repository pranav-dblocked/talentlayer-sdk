import { IPFSClientConfig } from '../types';

export default class IPFSClient {
  static readonly IPFS_CLIENT_ERROR = 'IPFS client not initialised';
  ipfs: any;
  authorization: string | undefined; 
  provider: string | undefined;
  initialized: boolean = false;

  constructor(ipfsClientConfig: IPFSClientConfig) {
    this.provider = ipfsClientConfig.provider;
    if (ipfsClientConfig.provider === 'quicknode') {
      this.authorization = ipfsClientConfig.apiKey;
      this.initialized = true;
    }
    else if (ipfsClientConfig.provider === 'infura') {
      const authorization =
        'Basic ' + btoa(ipfsClientConfig.clientId + ':' + ipfsClientConfig.clientSecret);
      this.authorization = authorization;
      import('kubo-rpc-client').then(({ create }) => {
        this.ipfs = create({
          url: ipfsClientConfig.baseUrl,
          headers: {
            authorization,
          },
        });
      });
      this.initialized = true;
    }
  }

  public async post(data: string): Promise<string> {
    if (!this.initialized) {
      throw Error('IPFS client not initialised properly');
    }

    if (this.authorization) {
      if (this.provider === 'quicknode') {
        const myHeaders = new Headers();
        myHeaders.append("x-api-key", this.authorization);
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          "cid": data, // Assuming data already contains the CID
          "name": "image.png",
          "origins": [
            "/ip4/123.12.113.142/tcp/4001/p2p/SourcePeerId",
            "/ip4/123.12.113.114/udp/4001/quic/p2p/SourcePeerId"
          ],
          "meta": {
            "test": "mycooltest",
            "morevalue": {
              "location": "/home"
            }
          }
        });

        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow' as RequestRedirect
        };

        try {
          const response = await fetch("https://api.quicknode.com/ipfs/rest/v1/pinning", requestOptions);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const result = await response.text();
          return result;
        } catch (error) {
          console.error('Error:', error);
          throw new Error(`IPFS client not initialised properly`);
        }
      } else if (this.provider === 'infura') {
        const result = await this.ipfs.add(data);
        await this.ipfs.pin.add(result.path);
        return result.path;
      } else {
        throw new Error('Invalid provider specified');
      }
    } else {
      throw new Error('Authorization token not provided');
    }
  }
}