export interface MenuItem {
    title: string;
    icon: string;
    route?: string;
    children?: MenuItem[];
  }
  
  export const SIDEBAR_MENU: MenuItem[] = [
    { title: 'Inicio', icon: 'bi bi-house', route: '/dashboard' },
    { title: 'Usuarios', icon: 'bi bi-people', route: '/users' },
    {
      title: 'Configuración',
      icon: 'bi bi-gear',
      children: [
        { title: 'Perfil', icon: 'bi bi-person', route: '/settings/profile' },
        { title: 'Seguridad', icon: 'bi bi-shield-lock', route: '/settings/security' },
      ],
    },
  ];
  