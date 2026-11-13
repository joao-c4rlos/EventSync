import { Component, computed, input } from '@angular/core';
import {
  Ban, Bell, Calendar, CalendarCheck, CalendarClock, CalendarX, Check, ChevronDown, CircleCheck, Clock,
  Eye, EyeOff, Globe, Heart, LayoutDashboard, Link, LogOut, Mail, MapPin, Menu, Mic, Monitor, Moon,
  Pencil, PiggyBank, Plus, RefreshCw, RotateCcw, Search, Settings, ShieldCheck, SlidersHorizontal,
  Smartphone, SquarePen, Sun, Trash2, User, UserCheck, UserCog, UserPlus, UserX, Users, Wallet, X, CreditCard,
  Info, TriangleAlert, Ticket, DollarSign, Download, ArrowLeft, ArrowUp, ArrowDown, FilePen,
  type IconNode,
} from 'lucide';

/** Ícones do Lucide usados na interface (traço de 2px, grade 24x24). */
const ICONES: Record<string, IconNode> = {
  ban: Ban, bell: Bell, calendar: Calendar, 'calendar-check': CalendarCheck, 'calendar-clock': CalendarClock,
  'calendar-x': CalendarX, check: Check, 'chevron-down': ChevronDown, 'circle-check': CircleCheck, clock: Clock,
  'credit-card': CreditCard, 'dollar-sign': DollarSign, download: Download, eye: Eye, 'eye-off': EyeOff,
  globe: Globe, heart: Heart, info: Info, 'layout-dashboard': LayoutDashboard, link: Link, 'log-out': LogOut,
  mail: Mail, 'map-pin': MapPin, menu: Menu, mic: Mic, monitor: Monitor, moon: Moon, pencil: Pencil,
  'piggy-bank': PiggyBank, plus: Plus, 'refresh-cw': RefreshCw, 'rotate-ccw': RotateCcw, search: Search,
  settings: Settings, 'shield-check': ShieldCheck, 'sliders-horizontal': SlidersHorizontal,
  smartphone: Smartphone, 'square-pen': SquarePen, sun: Sun, ticket: Ticket, 'trash-2': Trash2,
  'triangle-alert': TriangleAlert, user: User, 'user-check': UserCheck, 'user-cog': UserCog, 'user-plus': UserPlus, 'user-x': UserX,
  users: Users, wallet: Wallet, x: X, 'arrow-left': ArrowLeft, 'arrow-up': ArrowUp, 'arrow-down': ArrowDown, 'file-pen': FilePen,
};

@Component({
  selector: 'app-icone',
  host: { class: 'icone', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      @for (parte of partes(); track $index) {
        @switch (parte[0]) {
          @case ('path') { <svg:path [attr.d]="parte[1]['d']" /> }
          @case ('circle') { <svg:circle [attr.cx]="parte[1]['cx']" [attr.cy]="parte[1]['cy']" [attr.r]="parte[1]['r']" /> }
          @case ('rect') {
            <svg:rect [attr.x]="parte[1]['x']" [attr.y]="parte[1]['y']" [attr.width]="parte[1]['width']"
              [attr.height]="parte[1]['height']" [attr.rx]="parte[1]['rx']" />
          }
          @case ('line') {
            <svg:line [attr.x1]="parte[1]['x1']" [attr.y1]="parte[1]['y1']" [attr.x2]="parte[1]['x2']" [attr.y2]="parte[1]['y2']" />
          }
          @case ('polyline') { <svg:polyline [attr.points]="parte[1]['points']" /> }
          @case ('ellipse') {
            <svg:ellipse [attr.cx]="parte[1]['cx']" [attr.cy]="parte[1]['cy']" [attr.rx]="parte[1]['rx']" [attr.ry]="parte[1]['ry']" />
          }
        }
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; width: 1em; height: 1em; font-size: 20px; line-height: 1; flex-shrink: 0; }
    svg { width: 100%; height: 100%; }
  `,
})
export class Icone {
  /** Nome do ícone no Lucide, em kebab-case (ex.: "calendar-check"). */
  readonly nome = input.required<string>();

  protected readonly partes = computed(() => (ICONES[this.nome()] ?? []) as unknown as [string, Record<string, string>][]);
}
