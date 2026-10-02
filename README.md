# honeyglass-calc

A glassmorphism calculator built with plain HTML, CSS and JavaScript, in a warm honey and amber palette. No frameworks, no build step.

**Live demo:** https://superguine.github.io/honeyglass-calc/



## Features

- Frosted-glass interface with a blurred, colorful backdrop
- Fully rounded buttons with press feedback
- Addition, subtraction, multiplication, division and percent
- Clear (AC) and backspace
- Chained calculations, e.g. `5 + 3 × 2`, evaluated left to right as you press each operator
- Clear message on division by zero
- Full keyboard support
- Responsive layout that works on phones and desktops

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `0`-`9`, `.` | Enter numbers |
| `+` `-` `*` `/` | Operators |
| `%` | Percent (divides the current number by 100) |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete last digit |
| `Esc` or `Delete` | Clear all |

## Run locally

Clone the repo and open `index.html` in any modern browser:

```bash
git clone https://github.com/superguine/honeyglass-calc.git
cd honeyglass-calc
xdg-open index.html   # Linux; use `open index.html` on macOS
```

Or serve it with a local server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Project structure

```
honeyglass-calc/
├── index.html   # Markup
├── style.css    # Glassmorphism styling and layout
├── script.js    # Calculator logic and keyboard handling
└── README.md
```

## Color palette

From [Color Hunt](https://colorhunt.co/palette/f9e6a8f2a900cc6f004d2a00):

| Color | Hex |
| --- | --- |
| Cream | `#F9E6A8` |
| Amber | `#F2A900` |
| Burnt orange | `#CC6F00` |
| Dark brown | `#4D2A00` |

## Browser support

Works in current versions of Chrome, Edge, Firefox and Safari. The glass effect relies on `backdrop-filter`, which older browsers may not support.

## Deploy with GitHub Pages

1. Push the files to the `main` branch.
2. Go to **Settings → Pages**.
3. Set the source to `main` and `/ (root)`, then save.

## License

Released under the [MIT License](LICENSE).