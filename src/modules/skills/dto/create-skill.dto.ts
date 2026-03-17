import { IsEnum, IsString } from 'class-validator';
import { SkillType } from '../../../common/enums';

export class CreateSkillDto {
  @IsEnum(SkillType)
  type: SkillType;

  @IsString()
  value: string;
}
