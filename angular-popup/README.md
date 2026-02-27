# angular-popup

An Angular proof-of-concept showing two variants of the **side-panel controlling main-window content** pattern — equivalent to the `html-popup` POC.

## What it demonstrates

### ① Same-page side panel — Angular Material `MatSidenav`
The hamburger menu (top-right) opens a `mat-sidenav` drawer that slides in from the right. Typing in the drawer updates the main content area using Angular Signals — no cross-window communication needed.

### ② Cross-window popup — `PopupService` + `window.postMessage`
The "Open Popup Control Panel" button opens `popup.html` in a separate browser window. The `PopupService` listens for `postMessage` events and updates Angular Signals, which the template reacts to automatically.

## Project structure

```
src/
  app/
    app.ts           – AppComponent (imports MatSidenav, MatButton, etc.)
    app.html         – Template with mat-sidenav-container + popup buttons
    popup.service.ts – Injectable service: manages popup window & postMessage listener
public/
  popup.html         – Standalone popup window (vanilla HTML/JS, served as a static asset)
```

## Running locally

```bash
npm install
npm start          # ng serve — open http://localhost:4200
```

For production build:
```bash
npm run build      # outputs to dist/angular-popup/
```

## Key Angular patterns used

| Pattern | API |
|---------|-----|
| Reactive state | `signal()`, `computed()` |
| Dependency injection | `inject(PopupService)` |
| Material side drawer | `MatSidenavModule` |
| Cross-window messaging | `window.postMessage` + `window.addEventListener('message', …)` |

## Related libraries

| Goal | Library |
|------|---------|
| In-page side panel | [`@angular/material MatSidenav`](https://material.angular.io/components/sidenav) |
| Cross-window (multi-tab) | [`ngx-multi-window`](https://github.com/Nolanus/ngx-multi-window) |
| Multi-tab sync via storage | [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) |
