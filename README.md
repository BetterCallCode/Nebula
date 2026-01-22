Nebule is a browser-based visual design editor that allows users to create, position, resize, and manage layout elements directly on a canvas. The editor is inspired by modern design tools but is implemented entirely using standard web technologies, without relying on canvas rendering, SVG engines, or external frameworks.

The primary goal of this project is to demonstrate a strong understanding of DOM manipulation, event handling, coordinate calculations, layering logic, and state persistence using plain JavaScript. All visual elements are represented as regular HTML elements and are manipulated through mouse and keyboard interactions.

Users can add rectangles and text elements to the canvas, select and move them freely within bounds, resize them using corner handles, adjust properties such as size, color, opacity, rotation, and text content, and control the stacking order through a layers panel. The editor also supports basic keyboard shortcuts for movement and deletion to improve usability.

To ensure persistence, the project uses a minimal localStorage-based approach that saves the current visual layout of the canvas. On reload, the layout is restored and interactivity is reattached, allowing users to continue from where they left off. Additionally, the editor supports exporting the design as JSON or HTML for portability.

Nebule focuses on correctness, clarity, and predictable behavior rather than performance optimizations or advanced rendering techniques, making it a practical demonstration of building an interactive visual tool using only HTML, CSS, and vanilla JavaScript.
