import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DataStoreService } from '../../core/services/data-store.service';
import { Meeting } from '../../core/models/hr.model';
import { prettyDate } from '../../core/utils/format';
import { paginate } from '../../core/utils/paginate';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ModalComponent } from '../../shared/ui/modal/modal';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator';

interface MeetingForm {
  id: string | null;
  title: string;
  date: string;
  time: string;
  durationMins: number;
  attendees: string;
}

@Component({
  selector: 'app-meetings',
  imports: [
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    PaginatorComponent,
  ],
  templateUrl: './meetings.html',
  styleUrl: './meetings.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingsComponent {
  private readonly auth = inject(AuthService);
  protected readonly store = inject(DataStoreService);
  protected readonly prettyDate = prettyDate;

  protected readonly mine = computed(() =>
    this.store
      .meetings()
      .filter((m) => m.ownerId === this.auth.user()?.id)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
  );

  protected readonly others = computed(() =>
    this.store.meetings().filter((m) => m.ownerId !== this.auth.user()?.id),
  );

  protected readonly othersSize = 6;
  protected readonly othersPage = signal(1);
  protected readonly othersPageItems = computed(() =>
    paginate(this.others(), this.othersPage(), this.othersSize),
  );

  protected readonly editing = signal<MeetingForm | null>(null);
  protected readonly cancelling = signal<Meeting | null>(null);
  protected readonly toast = signal('');

  startAdd(): void {
    this.editing.set({
      id: null,
      title: '',
      date: new Date().toISOString().slice(0, 10),
      time: '10:00',
      durationMins: 30,
      attendees: '',
    });
  }

  startEdit(m: Meeting): void {
    this.editing.set({
      id: m.id,
      title: m.title,
      date: m.date,
      time: m.time,
      durationMins: m.durationMins,
      attendees: m.attendees,
    });
  }

  save(): void {
    const f = this.editing();
    if (!f || !f.title.trim() || !f.date || !f.time) {
      return;
    }
    if (f.id) {
      this.store.updateMeeting(f.id, {
        title: f.title.trim(),
        date: f.date,
        time: f.time,
        durationMins: Number(f.durationMins) || 30,
        attendees: f.attendees,
        status: 'Scheduled',
      });
      this.toast.set(`Updated "${f.title}".`);
    } else {
      this.store.addMeeting({
        title: f.title.trim(),
        date: f.date,
        time: f.time,
        durationMins: Number(f.durationMins) || 30,
        attendees: f.attendees,
        ownerId: this.auth.user()?.id ?? '',
      });
      this.toast.set(`Scheduled "${f.title}".`);
    }
    this.editing.set(null);
    this.flash();
  }

  confirmCancel(): void {
    const m = this.cancelling();
    if (!m) {
      return;
    }
    this.store.cancelMeeting(m.id);
    this.toast.set(`Cancelled "${m.title}".`);
    this.cancelling.set(null);
    this.flash();
  }

  markDone(m: Meeting): void {
    this.store.updateMeeting(m.id, { status: 'Completed' });
    this.toast.set(`Marked "${m.title}" as completed.`);
    this.flash();
  }

  private flash(): void {
    setTimeout(() => this.toast.set(''), 2800);
  }
}
