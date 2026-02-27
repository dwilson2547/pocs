# react-popup

A React proof-of-concept showing the **cross-window control panel pattern** – equivalent to the `html-popup` POC but built with React hooks and `window.postMessage`.

## What it demonstrates

| File | Role |
|------|------|
| `index.html` | Main window – displays state controlled by the popup |
| `popup.html` | Popup control-panel window – sends messages to the main window |

The popup communicates with the main window using `window.postMessage()` instead of direct DOM references, which is the modern, security-conscious approach.

## How to run

Serve both HTML files from the same origin (required by browser security for `window.open`):

```bash
# Option A – Python built-in server
python3 -m http.server 8080
# then open http://localhost:8080/index.html

# Option B – Node http-server
npx http-server -p 8080
# then open http://localhost:8080/index.html
```

## Pattern comparison

### This POC (vanilla HTML, original)
Uses direct DOM reference sharing between windows – simple, but fragile:
```js
window.popup.onload = () => {
  txt1.value = window.popup.document.getElementById('txtPopUp').value;
};
```

### React version (this folder)
Uses `window.postMessage` + `useEffect` listener – decoupled and secure:
```jsx
// Main window – listens for messages
useEffect(() => {
  window.addEventListener('message', ({ data }) => {
    if (data.type === 'UPDATE_TEXT') setText(data.value);
  });
}, []);

// Popup – sends messages
window.opener.postMessage({ type: 'UPDATE_TEXT', value }, '*');
```

### Angular equivalent (see `angular-popup/`)
The same cross-window pattern lives in `PopupService`, while a built-in
`mat-sidenav` provides the in-page drawer variant:
```ts
// PopupService
window.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_TEXT') this.text.set(event.data.value);
});
```

## Related libraries

| Framework | Same-page side panel | Cross-window |
|-----------|---------------------|--------------|
| **Angular** | [`MatSidenav`](https://material.angular.io/components/sidenav/overview) | [`ngx-multi-window`](https://github.com/Nolanus/ngx-multi-window) or custom service |
| **React** | [`@mui/material Drawer`](https://mui.com/material-ui/react-drawer/) | Custom hook + `window.postMessage` |
| **Any** | CSS-only drawer | [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) |
