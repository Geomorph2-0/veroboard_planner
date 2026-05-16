# Todo

## Print guard + New project confirmation

- [x] Add `canPrint` prop to `FileMenuBtn` and `Ribbon` in `Ribbon.tsx`; disable Print item when false
- [x] Pass `canPrint={store.project.board !== null}` from `App.tsx`
- [x] Intercept `onNew` in `App.tsx` — show confirm dialog when board exists
- [x] Add confirm dialog JSX (overlay + card + 3 buttons) to `App.tsx`
- [x] Add confirm dialog CSS classes to `App.module.css`
- [x] `npm run build` — no type errors
