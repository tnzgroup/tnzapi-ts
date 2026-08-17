import { IsOptional, IsString } from 'class-validator';

// No Notes field — deliberately omitted, see Task 15's header note: IContactFields has nowhere
// to put it on this SDK, unlike IOptOutCreateArgs (Task 19), which does support Notes.
export class ContactFieldsDto {
    @IsOptional() @IsString() Title?: string;
    @IsOptional() @IsString() Company?: string;
    @IsOptional() @IsString() FirstName?: string;
    @IsOptional() @IsString() LastName?: string;
    @IsOptional() @IsString() Position?: string;
    @IsOptional() @IsString() Attention?: string;
    @IsOptional() @IsString() RecipDepartment?: string;
    @IsOptional() @IsString() StreetAddress?: string;
    @IsOptional() @IsString() Suburb?: string;
    @IsOptional() @IsString() City?: string;
    @IsOptional() @IsString() State?: string;
    @IsOptional() @IsString() Country?: string;
    @IsOptional() @IsString() Postcode?: string;
    @IsOptional() @IsString() MainPhone?: string;
    @IsOptional() @IsString() DirectPhone?: string;
    @IsOptional() @IsString() MobilePhone?: string;
    @IsOptional() @IsString() AltPhone1?: string;
    @IsOptional() @IsString() AltPhone2?: string;
    @IsOptional() @IsString() FaxNumber?: string;
    @IsOptional() @IsString() EmailAddress?: string;
    @IsOptional() @IsString() WebAddress?: string;
    @IsOptional() @IsString() Custom1?: string;
    @IsOptional() @IsString() Custom2?: string;
    @IsOptional() @IsString() Custom3?: string;
    @IsOptional() @IsString() Custom4?: string;
    @IsOptional() @IsString() Timezone?: string;
    @IsOptional() @IsString() ViewBy?: string;
    @IsOptional() @IsString() EditBy?: string;
}
