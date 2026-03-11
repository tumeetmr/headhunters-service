import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  slug?: string;

  @IsOptional() @IsString()
  industry?: string;

  @IsOptional() @IsUrl()
  website?: string;

  @IsOptional() @IsUrl()
  logoUrl?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  size?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsUUID(undefined, { each: true })
  skillIds?: string[];
}
