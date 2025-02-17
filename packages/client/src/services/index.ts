import { Hash } from 'viem';
import GraphQLClient from '../graphql';
import IPFSClient from '../ipfs';
import { Logger } from '../logger';
import { getPlatformById } from '../platform/graphql/queries';
import { ClientTransactionResponse } from '../types';
import { getSignature } from '../utils/signature';
import { ViemClient } from '../viem';
import {
  getOne,
  getServices,
  searchServices,
} from './graphql/queries';
import { ICreateServiceSignature, IProps, ServiceDetails } from './types';

export interface IService {
  getOne(id: string): Promise<any>;
  create(
    serviceDetails: ServiceDetails,
    userId: string,
    platformId: number,
  ): Promise<ClientTransactionResponse>;
  update(
    serviceDetails: ServiceDetails,
    userId: string,
    existingServiceId: number,
  ): Promise<ClientTransactionResponse>;
  updloadServiceDataToIpfs(serviceData: ServiceDetails): Promise<string>;
  getServices(params: IProps): Promise<any>;
  search(params: IProps): Promise<any>;
  cancel(userId: string, serviceId: number): Promise<Hash>;
}

/**
 * Class representing Services inside TalentLayer
 */
export class Service {
  /** @hidden */
  graphQlClient: GraphQLClient;
  /** @hidden */
  ipfsClient: IPFSClient;
  /** @hidden */
  viemClient: ViemClient;
  /** @hidden */
  platformID: number;
  /** @hidden */
  signatureApiUrl?: string;
  /** @hidden */
  logger: Logger

  /** @hidden */
  constructor(
    graphQlClient: GraphQLClient,
    ipfsClient: IPFSClient,
    viemClient: ViemClient,
    platformId: number,
    logger: Logger,
    signatureApiUrl?: string,
  ) {
    logger.info('Service initialising');
    this.graphQlClient = graphQlClient;
    this.platformID = platformId;
    this.ipfsClient = ipfsClient;
    this.viemClient = viemClient;
    this.logger = logger;
    this.signatureApiUrl = signatureApiUrl;
  }

  /**
   * Asynchronously gets the service signature.
   * @param {ICreateServiceSignature} args - The arguments to get the service signature.
   * @returns {Promise<any>} - A promise that resolves to the service signature.
  */
  public async getServiceSignature(args: ICreateServiceSignature) {
    return getSignature('createService', args, this.signatureApiUrl);
  }

  /**
   * Asynchronously retrieves a single service by its ID.
   * @param {string} id - The ID of the service to retrieve.
   * @returns {Promise<any>} - A promise that resolves to the retrieved service.
  */
  public async getOne(id: string): Promise<any> {
    const query = getOne(id);

    const response = await this.graphQlClient.get(query);

    return response?.data?.service || {};
  }

  /**
   * Asynchronously uploads service data to IPFS.
   * @param {ServiceDetails} serviceData - The service data to upload.
   * @returns {Promise<string>} - A promise that resolves to the IPFS address of the uploaded data.
  */
  public async updloadServiceDataToIpfs(serviceData: ServiceDetails): Promise<string> {
    if (this.ipfsClient) {
      return this.ipfsClient.post(JSON.stringify(serviceData));
    }

    throw new Error(IPFSClient.IPFS_CLIENT_ERROR);
  }

  /**
   * Asynchronously gets multiple services based on provided parameters.
   * @param {IProps} params - The parameters to filter the services.
   * @returns {Promise<any>} - A promise that resolves to the list of services.
  */
  public async getServices(params: IProps): Promise<any> {

    return this.graphQlClient.get(getServices(params));
  }

  /**
   * Asynchronously searches for services based on provided parameters.
   * @param {IProps} params - The search parameters.
   * @returns {Promise<any>} - A promise that resolves to the search results.
  */
  public async search(params: IProps): Promise<any> {
    return this.graphQlClient.get(searchServices(params));
  }

  /**
   * Asynchronously creates a new service.
   * @param {ServiceDetails} serviceDetails - The details of the service to create.
   * @param {string} userId - The user ID creating the service.
   * @param {number} platformId - The platform ID where the service is created.
   * @returns {Promise<ClientTransactionResponse>} - A promise that resolves to the transaction response of the service creation.
  */
  public async create(
    serviceDetails: ServiceDetails,
    userId: string,
    platformId: number,
  ): Promise<ClientTransactionResponse> {
    const platformDetailsResponse = await this.graphQlClient.get(
      getPlatformById(this.platformID.toString()),
    );

    let servicePostingFee = platformDetailsResponse?.data?.platform.servicePostingFee;
    servicePostingFee = BigInt(servicePostingFee || '0');

    const cid = await this.updloadServiceDataToIpfs(serviceDetails);
    const signature = await this.getServiceSignature({
      profileId: Number(userId),
      cid,
    });

    const tx = await this.viemClient.writeContract(
      'talentLayerService',
      'createService',
      [userId, platformId, cid, signature],
      servicePostingFee,
    );

    if (cid && tx) {
      return { cid, tx };
    }

    throw new Error('Unable to create service');
  }

  /**
   * Asynchronously updates an existing service.
   * @param {ServiceDetails} serviceDetails - The details of the service to update.
   * @param {string} userId - The user ID updating the service.
   * @param {number} existingServiceId - The existing Service ID which is getting updated.
   * @returns {Promise<ClientTransactionResponse>} - A promise that resolves to the transaction response of the service update.
  */
  public async update(
    serviceDetails: ServiceDetails,
    userId: string,
    existingServiceId: number,
  ): Promise<ClientTransactionResponse> {

    const cid = await this.updloadServiceDataToIpfs(serviceDetails);

    const tx = await this.viemClient.writeContract(
      'talentLayerService',
      'updateServiceData',
      [userId, existingServiceId, cid],
    );

    if (cid && tx) {
      return { cid, tx };
    }

    throw new Error('Unable to update service');
  }

  /**
   * Cancel an existing service.
   * @param {string} userId - Id of the user cancelling the service
   * @param {number} serviceId - Id of the service being updated
   * @returns {Promise<Hash>} - A promise that resolves to the transaction hash for the cancelService function call
  */
  public async cancel(
    userId: string,
    serviceId: number
  ): Promise<Hash> {
    const tx = await this.viemClient.writeContract(
      'talentLayerService',
      'cancelService',
      [userId, serviceId]
    )

    if (tx) {
      return tx;
    }

    throw new Error('Unable to cancel service');
  }
}
