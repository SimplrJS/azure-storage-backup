import { BlobService, ServiceResponse, common } from "azure-storage";
export declare type BlobDownloadDto = ResultDto<BlobService.BlobResult>;
export declare type ServicePropertiesDto = ResultDto<common.models.ServicePropertiesResult.ServiceProperties>;
export interface ResultDto<TResult> {
    Result: TResult;
    ServiceResponse: ServiceResponse;
    LocalContentLength?: number;
}
