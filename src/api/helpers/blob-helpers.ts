import * as path from "path";
import { BlobService, common } from "azure-storage";
import { Writable } from "stream";
import * as globby from "globby";
import { IOptions } from "glob";
import * as fs from "fs-extra";
import { BlobDownloadDto, ServicePropertiesDto } from "../contracts/blob-helpers-contracts";
import { LocalFileDto } from "../../cli/contracts";
import { AsyncManager, AsyncGenerator } from "../promises/async-handler";

export const BLOB_NAME_SEPARATOR: string = "/";
export const GLOBBY_SEPARATOR: string = "/";

export function ConstructHost(storageAccount: string): string {
    return `https://${storageAccount}.blob.core.windows.net`;
}

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

export function GetMissingBlobs(blobList: BlobService.BlobResult[], localDownloadedList: LocalFileDto[]): string[] {
    if (localDownloadedList.length <= 0) {
        return blobList.map(x => x.name);
    }

    const newItems: string[] = new Array<string>();
    for (let i = 0; i < blobList.length; i++) {
        const blob = blobList[i];
        // Blob not exists in local file list
        const localFileIndex = localDownloadedList.findIndex(x => x.blobName === blob.name);
        if (localFileIndex === -1) {
            newItems.push(blob.name);
        } else {
            // Blob size not the same as downloaded local file
            const localFile = localDownloadedList[localFileIndex];
            const blobContentLength = Number(blob.contentLength);
            if (!isFinite(blobContentLength)) {
                console.warn(`${blob.name} 'contentLength': ${blob.contentLength} is not a number`);
                continue;
            }
            if (localFile.size !== blobContentLength) {
                newItems.push(blob.name);
            }
        }
    }

    return newItems;
}

export async function GetLocalFiles(sourcePath: string, patterns: string[] = ["**/*"]): Promise<LocalFileDto[]> {
    const options: IOptions = {
        cwd: sourcePath,
        nodir: true
    };
    const localFiles = await globby(patterns, options);

    const asyncFunctionArray = new Array<AsyncGenerator<LocalFileDto>>();
    const result = new Array<LocalFileDto>();
    for (let i = 0; i < localFiles.length; i++) {
        const localFile = localFiles[i];
        asyncFunctionArray.push(async () => {
            const fullPath = path.join(sourcePath, localFile);
            const stats = await fs.stat(fullPath);
            const localFileDto: LocalFileDto = {
                fullPath: fullPath,
                blobName: localFile,
                size: stats.size
            };
            result.push(localFileDto);
            return localFileDto;
        });

    }
    const asyncManager = new AsyncManager<LocalFileDto>(asyncFunctionArray, 5);
    await asyncManager.Start();

    return result;
}
