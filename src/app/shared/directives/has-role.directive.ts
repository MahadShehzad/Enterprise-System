import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/role.model';

type RoleInput = Role | Role[];

/**
 * Structural directive that renders its content only when the current user's
 * role is permitted.
 *
 *   <button *appHasRole="'Admin'">Delete</button>
 *   <a *appHasRole="['Manager', 'Admin']">Reports</a>
 *   <section *appHasRole="'Manager'; mode: 'min'">Manager and up</section>
 */
@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  private readonly tpl = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  /** Role or roles allowed to see the content. */
  readonly appHasRole = input.required<RoleInput>();

  /** 'exact' (default) = role must be in the list; 'min' = hierarchical. */
  readonly appHasRoleMode = input<'exact' | 'min'>('exact');

  private rendered = false;

  constructor() {
    effect(() => {
      const allowed = this.normalise(this.appHasRole());
      const mode = this.appHasRoleMode();
      const permitted =
        mode === 'min'
          ? this.auth.hasMinRole(allowed[0])
          : this.auth.hasAnyRole(allowed);

      if (permitted && !this.rendered) {
        this.vcr.createEmbeddedView(this.tpl);
        this.rendered = true;
      } else if (!permitted && this.rendered) {
        this.vcr.clear();
        this.rendered = false;
      }
    });
  }

  private normalise(value: RoleInput): Role[] {
    return Array.isArray(value) ? value : [value];
  }
}
