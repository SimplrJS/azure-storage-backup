import * as path from "path";
import fastGlob, { IOptions } from "fast-glob";
import { BlobService, common } from "azure-storage";
import { Writable } from "stream";
import { BlobDownloadDto, ServicePropertiesDto } from "../contracts/blob-helpers-contracts";
import { LocalFileDto } from "../../cli/cli-contracts";
/**
 * Constructs host of Azure storage account.
 */
export function ConstructHost(storageAccount: string): string {
    return `https://${storageAccount}.blob.core.windows.net`;
}

/**
 * Retrieves Azure Storage service properties.
 */
export async function GetServiceProperties(blobService: BlobService, options: common.RequestOptions = {}): Promise<ServicePropertiesDto> {
    return new Promise<ServicePropertiesDto>((resolve, reject) => {
        blobService.getServiceProperties(options, (error, result, response) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    Result: result,
                    ServiceResponse: response
                });
            }
        });
    });
}

/**
 * Retrieves containers list of an Azure Storage account.
 */
export async function GetContainersList(
    blobService: BlobService,
    continuationToken?: common.ContinuationToken,
    options: BlobService.ListContainerOptions = {}
): Promise<BlobService.ListContainerResult> {
    return new Promise<BlobService.ListContainerResult>((resolve, reject) => {
        // TODO: remove `as common.ContinuationToken` when `azure-storage` updated.
        blobService.listContainersSegmented(
            continuationToken as common.ContinuationToken,
            options,
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
    });
}

/**
 * Retrieves container's blobs list.
 */
export async function GetBlobsList(
    blobService: BlobService,
    containerName: string,
    continuationToken?: common.ContinuationToken,
    options: BlobService.ListContainerOptions = {}
): Promise<BlobService.ListBlobsResult> {
    return new Promise<BlobService.ListBlobsResult>((resolve, reject) => {
        // TODO: remove `as common.ContinuationToken` when `azure-storage` updated.
        blobService.listBlobsSegmented(
            containerName,
            continuationToken as common.ContinuationToken,
            options,
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
    });
}

/**
 * Downloads blob to a file.
 */
export async function GetBlobToLocalFile(
    blobService: BlobService,
    containerName: string,
    blobName: string,
    localFileName: string = path.join(process.cwd(), blobName),
    options: BlobService.GetBlobRequestOptions = {}
): Promise<BlobDownloadDto> {
    return new Promise<BlobDownloadDto>((resolve, reject) => {
        blobService.getBlobToLocalFile(containerName, blobName, localFileName, (error, blobResult, serviceResponse) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    Result: blobResult,
                    ServiceResponse: serviceResponse
                });
            }
        });
    });
}

/**
 * Downloads blob to a stream.
 */
export async function GetBlobToStream(
    blobService: BlobService,
    containerName: string,
    blobName: string,
    writeStream: Writable,
    options: BlobService.GetBlobRequestOptions = {}
): Promise<BlobDownloadDto> {
    return new Promise<BlobDownloadDto>((resolve, reject) => {
        blobService.getBlobToStream(
            containerName,
            blobName,
            writeStream,
            options,
            (error, blobResult, serviceResponse) => {
                if (error) {
                    reject(error);
                } else {
                    const stream = writeStream as Writable & { bytesWritten: number };
                    resolve({
                        Result: blobResult,
                        ServiceResponse: serviceResponse,
                        LocalContentLength: stream.bytesWritten
                    });
                }
            });
    });
}

/**
 * Filters in blobs that are missing in supplied list of LocalFileDto.
 * If blob file in file system is different size, it counts as missing file.
 *
 * @returns List of fs.stats objects with paths.
 */
export function FilterMissingBlobsList(blobsList: BlobService.BlobResult[], localDownloadedList: LocalFileDto[]): BlobService.BlobResult[] {
    if (localDownloadedList.length <= 0) {
        return blobsList;
    }

    const newItems: BlobService.BlobResult[] = new Array<BlobService.BlobResult>();
    for (const blob of blobsList) {
        const localFileIndex = localDownloadedList.findIndex(x => x.path === blob.name);
        // Blob does not exist in local files list
        if (localFileIndex === -1) {
            newItems.push(blob);
        } else {
            // Blob size is not the same as downloaded local file
            const localFilePath = localDownloadedList[localFileIndex];
            const blobContentLength = Number(blob.contentLength);

            if (!isFinite(blobContentLength)) {
                console.warn(`"${blob.name}" 'contentLength': ${blob.contentLength} is not a finite number.`);
                continue;
            }

            if (localFilePath.size !== blobContentLength) {
                newItems.push(blob);
            }
        }
    }

    return newItems;
}

/**
 * Retrieves a local files list (fs.stats objects with paths) using glob patterns.
 *
 * @param containerSourcePath Path to container blobs.
 * @returns Local files list (fs.stats objects with paths).
 */
export async function GetLocalFilesList(containerSourcePath: string, pattern: string[] = ["**/*"]): Promise<LocalFileDto[]> {
    const options: IOptions = {
        cwd: containerSourcePath,
        stats: true,
        onlyFiles: true
    };

    return await fastGlob(pattern, options);
}

/**
 * Retrieves directories list of source path using glob pattern.
 */
export async function GetLocalDirectoriesList(sourcePath: string, pattern: string[] = ["*"]): Promise<string[]> {
    const options: IOptions = {
        cwd: sourcePath,
        onlyDirs: true
    };

    return await fastGlob(pattern, options);
}
