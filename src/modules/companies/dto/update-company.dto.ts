import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

const emptyStringToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }
  return value;
};

export class UpdateCompanyDto {
  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  slug?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  industry?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUrl()
  website?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  size?: string;

  @IsOptional()
  @Transform(emptyStringToUndefined)
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID(undefined, { each: true })
  skillIds?: string[];
}
