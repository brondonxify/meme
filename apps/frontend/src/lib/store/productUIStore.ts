import { create } from 'zustand';

export interface Color {
  name: string;
  code: string;
}

interface ProductUIState {
  colorSelection: Color;
  sizeSelection: string;
  setColorSelection: (color: Color) => void;
  setSizeSelection: (size: string) => void;
}

export const useProductUIStore = create<ProductUIState>()((set) => ({
  colorSelection: { name: 'Brown', code: 'bg-[#4F4631]' },
  sizeSelection: 'Small',
  setColorSelection: (color) => set({ colorSelection: color }),
  setSizeSelection: (size) => set({ sizeSelection: size }),
}));
