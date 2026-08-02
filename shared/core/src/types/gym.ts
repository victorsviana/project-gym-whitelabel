export interface GymTheme {
  /** Cor principal da academia — hex, ex. '#E4022E'. */
  brand: string;
  /** Cor de texto/ícone sobre a cor principal. */
  brandFg: string;
  /** Tema padrão da academia; o aluno pode trocar. */
  mode: 'dark' | 'light';
}

export interface Gym {
  id: string;
  name: string;
  /** Único; vira subdomínio na Fase 2. */
  slug: string;
  /** Fallback quando não há logo. */
  initials: string;
  /** Data URL na Fase 1, URL de object storage na Fase 2. */
  logo: string | null;
  theme: GymTheme;
  createdAt: string;
}
