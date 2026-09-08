import { Role } from './role.model';
import { FeatureKey } from './tenant.model';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  /** Feature this item belongs to – hidden if the tenant has it disabled. */
  feature: FeatureKey;
  /** Roles allowed to see and navigate to this item. */
  roles: Role[];
}
