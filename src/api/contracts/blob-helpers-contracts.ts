import { BlobService, ServiceResponse } from "azure-storage";

export interface BlobDownloadDto {
    BlobResult: BlobService.BlobResult;
    ServiceResponse: ServiceResponse;
}
