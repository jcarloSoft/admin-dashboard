import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  openMenus: { [key: string]: boolean } = {};

  toggleMenu(menu: string) {
    this.openMenus[menu] = !this.openMenus[menu];
  }

  isMenuOpen(menu: string): boolean {
    return this.openMenus[menu];
  }
}
