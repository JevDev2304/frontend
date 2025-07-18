import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store'; // Importa los tipos que acabas de exportar

// Usa estos hooks en lugar de `useDispatch` y `useSelector` en toda tu aplicación
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;