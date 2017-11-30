/// <reference types="node" />
import { BlobService, common } from "azure-storage";
import { Writable } from "stream";
import { BlobDownloadDto, ServicePropertiesDto } from "../contracts/blob-helpers-contracts";
import { LocalFileDto } from "../../cli/cli-contracts";
/**
 * Constructs host of Azure storage account.
 */
export declare function ConstructHost(storageAccount: string): string;
/**
 * Retrieves Azure Storage service properties.
 */
export declare function GetServiceProperties(blobService: BlobService, options?: common.RequestOptions): Promise<ServicePropertiesDto>;
/**
 * Retrieves containers list of an Azure Storage account.
 */
export declare function GetContainersList(blobService: BlobService, continuationToken?: common.ContinuationToken, options?: BlobService.ListContainerOptions): Promise<BlobService.ListContainerResult>;
/**
 * Retrieves container's blobs list.
 */
export declare function GetBlobsList(blobService: BlobService, containerName: string, continuationToken?: common.ContinuationToken, options?: BlobService.ListContainerOptions): Promise<BlobService.ListBlobsResult>;
/**
 * Downloads blob to a file.
 */
export declare function GetBlobToLocalFile(blobService: BlobService, containerName: string, blobName: string, localFileName?: string, options?: BlobService.GetBlobRequestOptions): Promise<BlobDownloadDto>;
/**
 * Downloads blob to a stream.
 */
export declare function GetBlobToStream(blobService: BlobService, containerName: string, blobName: string, writeStream: Writable, options?: BlobService.GetBlobRequestOptions): Promise<BlobDownloadDto>;
/**
 * Filters in blobs that are missing in supplied list of LocalFileDto.
 * If blob file in file system is different size, it counts as missing file.
 *
 * @returns List of fs.stats objects with paths.
 */
export declare function FilterMissingBlobsList(blobsList: BlobService.BlobResult[], localDownloadedList: LocalFileDto[]): BlobService.BlobResult[];
/**
 * Retrieves a local files list (fs.stats objects with paths) using glob patterns.
 *
 * @param containerSourcePath Path to container blobs.
 * @returns Local files list (fs.stats objects with paths).
 */
export declare function GetLocalFilesList(containerSourcePath: string, pattern?: string[]): Promise<LocalFileDto[]>;
/**
 * Retrieves directories list of source path using glob pattern.
 */
export declare function GetLocalDirectoriesList(sourcePath: string, pattern?: string[]): Promise<string[]>;
