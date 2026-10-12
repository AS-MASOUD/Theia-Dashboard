# Static Fonts Directory

Place your custom web font files (`.woff2`, `.woff`, `.ttf`) here (e.g. `Vazirmatn`, custom branding fonts).

### Usage in CSS
You can reference static font files located here in `src/app/globals.css`:

```css
@font-face {
  font-family: 'MyCustomFont';
  src: url('/fonts/MyCustomFont.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

Or use Next.js local fonts with `next/font/local` in `src/app/layout.tsx`.
