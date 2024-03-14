import { IPFSClientConfig } from '../types';

export default class IPFSClient {
  static readonly IPFS_CLIENT_ERROR = 'IPFS client not initialised';
  url: string;
  secret: string;

  constructor(ipfsClientConfig: IPFSClientConfig) {
    this.url = ipfsClientConfig.baseUrl;
    this.secret = ipfsClientConfig.clientSecret;
  }

  public async post(data: string): Promise<string> {
    try {
      const myHeaders = new Headers();
      myHeaders.append('x-api-key', this.secret as unknown as string);

      const formdata = new FormData();
      formdata.append('Body', new Blob([data], { type: 'application/json' }));
      formdata.append('Key', 'metadata');
      formdata.append('ContentType', 'application/json');

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
      };

      const response = await fetch(
        this.url,
        // @ts-ignore
        requestOptions,
      );
      const result: { pin?: { cid?: string } } = await response.json();

      if (!result.pin?.cid) throw new Error('Error while uploading to IPFS - no cid returned');

      return result.pin.cid;
    } catch (error: any) {
      throw new Error('Error while uploading to IPFS - post failed');
    }
  }
}
