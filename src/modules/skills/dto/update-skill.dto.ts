import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SkillType } from '../../../common/enums';

export class UpdateSkillDto {
  @IsOptional()
  @IsEnum(SkillType)
  type?: SkillType;

  @IsOptional()
  @IsString()
  value?: string;
}
