import { UsefulStuff } from "../../Functions";
import { WorkflowModel } from './models';
import { WorkflowApiRequestDTO, MessagingApiSuccessResponseDTO, MessagingBaseRequestDTO } from './dtos';
import { ErrorResponseDTO } from "../../Common/dtos";
import { IHttpClient } from "../../Common/IHttpClient";
import { ValidationResult } from "../../Common/ValidationResult";
import { BaseMessagingApi } from './BaseMessagingApi';
import { IWorkflowArgs } from './interfaces';

export class WorkflowApi extends BaseMessagingApi<WorkflowModel> {
    protected entity: WorkflowModel;
    protected readonly apiEndpoint = "/workflow";

    constructor(args: { URL: string; AuthToken?: string; httpClient?: IHttpClient }) {
        super(args.URL, args.AuthToken || "", args.httpClient);
        this.entity = new WorkflowModel();
    }

    public async SendMessage(args?: IWorkflowArgs): Promise<MessagingApiSuccessResponseDTO | ErrorResponseDTO> {
        return super.SendMessage(args);
    }

    protected createEntity(): WorkflowModel {
        return new WorkflowModel();
    }

    protected singleDestinationFields(): Array<[string, string]> {
        return [
            ['ToNumber', 'ToNumber'],
            ['MainPhone', 'MainPhone'],
            ['GroupID', 'GroupID'],
            ['ContactID', 'ContactID'],
        ];
    }

    protected validate(entity: WorkflowModel): ValidationResult {
        const base = this.baseValidate(entity);
        if (!base.valid) return base;

        if (UsefulStuff.isEmpty(entity.WorkflowTemplateID)) {
            return { valid: false, error: "Missing WorkflowTemplateID" };
        }

        return { valid: true };
    }

    protected createRequestDTO(entity: WorkflowModel): MessagingBaseRequestDTO {
        return new WorkflowApiRequestDTO(entity);
    }
}