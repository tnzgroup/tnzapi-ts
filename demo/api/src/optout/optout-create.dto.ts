import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OptOutCreateDto {
    @IsString()
    @IsNotEmpty()
    Destination!: string;

    @IsString()
    @IsNotEmpty()
    DestType!: string;

    @IsOptional() @IsString() Department?: string;
    @IsOptional() @IsString() SubAccount?: string;
    @IsOptional() @IsString() ContactID?: string;
    @IsOptional() @IsString() StopMessage?: string;
    @IsOptional() @IsString() Notes?: string;
}
