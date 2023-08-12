import { Pipe, PipeTransform } from "@angular/core";
import { UserRole } from "@flex-team/core";

@Pipe({ name: 'rolePipe' })
export class RolePipe implements PipeTransform {
  transform(value: UserRole): string {
    return UserRole[value];
  }
}