import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRecruiterTagDto {
  @IsUUID()
  skillId: string;

  @IsOptional()
  @IsString()
  meta?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
