import { IPFSClientConfig } from '../types';

export default class IPFSClient {
  static readonly IPFS_CLIENT_ERROR = 'IPFS client not initialised';
  ipfs: any;
  authorization: string | undefined;
  provider: string | undefined;
  initialized: boolean = false;

  constructor(ipfsClientConfig: IPFSClientConfig) {
    switch (ipfsClientConfig.provider) {
      case 'quicknode':
        this.authorization = ipfsClientConfig.apiKey;
        this.provider = 'quicknode';
        this.initialized = true;
        break;
      case 'infura':
        const authorization = 'Basic ' + btoa(ipfsClientConfig.clientId + ':' + ipfsClientConfig.clientSecret);
        this.authorization = authorization;
        this.provider = 'infura';
        import('kubo-rpc-client').then(({ create }) => {
          this.ipfs = create({
            url: ipfsClientConfig.baseUrl,
            headers: {
              authorization,
            },
          });
        });
        this.initialized = true;
        break;
      default:
        // Assume Infura if no provider is defined
        const defaultAuthorization = 'Basic ' + btoa(ipfsClientConfig.clientId + ':' + ipfsClientConfig.clientSecret);
        this.authorization = defaultAuthorization;
        this.provider = 'infura';
        import('kubo-rpc-client').then(({ create }) => {
          this.ipfs = create({
            url: ipfsClientConfig.baseUrl,
            headers: {
              authorization: defaultAuthorization,
            },
          });
        });
        this.initialized = true;
        break;
    }
  }

  public async post(data: string): Promise<string> {
    if (!this.initialized) {
      throw Error('IPFS client not initialised properly');
    }
    if (!this.authorization) {
      throw new Error('Authorization token not provided')
    }
    switch (this.provider) {
      case 'quicknode':
        return this.handleQuicknode(data);
      case 'infura':
        const result = await this.ipfs.add(data);
        await this.ipfs.pin.add(result.path);
        return result.path;
      default:
        throw new Error('Invalid provider specified');
    }
  }

  private async handleQuicknode(data: string): Promise<string> {
    if (this.authorization === undefined) {
      throw new Error('Authorization token not provided');
    }
  
    const myHeaders = new Headers();
    myHeaders.append("x-api-key", this.authorization);
    myHeaders.append("Content-Type", "application/json");
  
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: data,
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
  }
}