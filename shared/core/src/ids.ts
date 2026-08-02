const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const ID_LENGTH = 20;

/** Id local, único o suficiente para o uso em `localStorage` (Fase 1). Não é UUID nem criptográfico. */
export function createId(): string {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i += 1) {
    id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return id;
}
