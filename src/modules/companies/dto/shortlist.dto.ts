import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class AddShortlistDto {
  @IsUUID()
  @IsNotEmpty()
  recruiterProfileId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
