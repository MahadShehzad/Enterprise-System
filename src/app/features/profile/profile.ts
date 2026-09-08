import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { EditableProfile, initialsOf } from '../../core/models/user.model';
import { CardComponent } from '../../shared/ui/card/card';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ButtonComponent } from '../../shared/ui/button/button';
import { ModalComponent } from '../../shared/ui/modal/modal';

const MAX_AVATAR_BYTES = 1_500_000;

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly tenantCtx = inject(TenantContextService);

  private readonly fileInput =
    viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly user = this.auth.user;
  protected readonly tenants = this.tenantCtx.availableTenants;

  protected readonly initials = computed(() => {
    const u = this.user();
    return u ? initialsOf(u.name) : '';
  });

  protected readonly roleTone = computed(() => {
    switch (this.user()?.role) {
      case 'Admin':
        return 'success' as const;
      case 'Manager':
        return 'warning' as const;
      case 'Employee':
        return 'brand' as const;
      default:
        return 'neutral' as const;
    }
  });

  protected readonly editing = signal(false);
  protected readonly form = signal<EditableProfile | null>(null);
  protected readonly toast = signal('');
  protected readonly photoError = signal('');

  openEdit(): void {
    const u = this.user();
    if (!u) {
      return;
    }
    this.form.set({
      name: u.name,
      email: u.email,
      title: u.profile.title,
      department: u.profile.department,
      phone: u.profile.phone,
      location: u.profile.location,
      bio: u.profile.bio,
    });
    this.editing.set(true);
  }

  saveEdit(): void {
    const f = this.form();
    if (!f || !f.name.trim() || !f.email.trim()) {
      return;
    }
    this.auth.updateProfile({ ...f, name: f.name.trim(), email: f.email.trim() });
    this.editing.set(false);
    this.flash('Profile updated.');
  }

  pickPhoto(): void {
    this.photoError.set('');
    this.fileInput()?.nativeElement.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.photoError.set('Please choose an image file.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      this.photoError.set('Image is too large (max 1.5 MB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.auth.setAvatar(String(reader.result));
      this.flash('Profile photo updated.');
    };
    reader.onerror = () => this.photoError.set('Could not read that file.');
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.auth.setAvatar('');
    this.flash('Profile photo removed.');
  }

  private flash(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2800);
  }
}
