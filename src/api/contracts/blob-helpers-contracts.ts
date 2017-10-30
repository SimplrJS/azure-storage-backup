import { BlobService, ServiceResponse, common } from "azure-storage";

export type BlobDownloadDto = ResultDto<BlobService.BlobResult>;

export type ServicePropertiesDto = ResultDto<common.models.ServicePropertiesResult.ServiceProperties>;

export interface ResultDto<TResult> {
    Result: TResult;
    ServiceResponse: ServiceResponse;
}
