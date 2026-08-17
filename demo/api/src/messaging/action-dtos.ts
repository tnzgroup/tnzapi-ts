import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class RescheduleDto {
    @IsString()
    @IsNotEmpty()
    SendTime!: string;
}

export class ResubmitDto {
    @IsString()
    @IsNotEmpty()
    SendTime!: string;
}

// tnzapi-ts's own PacingApi.validate() only checks NumberOfOperators is a number, no range —
// @Min/@Max here are a demo-level sanity bound (matching the range TTS/Voice's send-time
// KeypadEditor-adjacent NumberOfOperators field uses), not a reproduction of an SDK-enforced limit.
export class PacingDto {
    @IsInt()
    @Min(1)
    @Max(99999)
    NumberOfOperators!: number;
}
