import { BlobService, common } from "azure-storage";
import { BlobDownloadDto } from "../contracts/blob-helpers-contracts";
import { Writable } from "stream";

export function ConstructHost(storageAccount: string): string {
    return `https://${storageAccount}.blob.core.windows.net`;
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
    localFileName: string,
    options: BlobService.GetBlobRequestOptions = {}
): Promise<BlobDownloadDto> {
    return new Promise<BlobDownloadDto>((resolve, reject) => {
        blobService.getBlobToLocalFile(containerName, blobName, localFileName, (error, blobResult, serviceResponse) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    BlobResult: blobResult,
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
                    resolve({
                        BlobResult: blobResult,
                        ServiceResponse: serviceResponse
                    });
                }
            });
    });
}
