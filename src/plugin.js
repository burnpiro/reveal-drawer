import keys from "./keys";
import colorContainer from "./controlPanel";

import "./styles.css";

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

const Drawer = () => {
  let options = {};
  let isPointerActive = false;
  let boards = {};
  let cursorListener = null;
  let mousedownListener = null;
  let mouseupListener = null;
  let drawerElement = null;
  let drawerElementContext = null;
  let drawerContainerElement = null;
  let colorsBoard = null;
  let eventDispatcher = null;
  let currentBoard = {
    drawerElement: null,
    drawerElementContext: null,
    paths: [],
  };
  let isBoardVisible = false;
  let isCtrlPressed = false;
  const mouse = {
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    isVisible: false,
  };

  function getKeyCode(key) {
    return keys[key];
  }

  function initOptions(config) {
    options = config.drawer || {};
    if (options.toggleDrawKey == null) {
      options.toggleDrawKey = "d";
    } else {
      options.toggleDrawKey = options.toggleDrawKey.toLowerCase();
    }
    if (options.toggleBoardKey == null) {
      options.toggleBoardKey = "t";
    } else {
      options.toggleBoardKey = options.toggleBoardKey.toLowerCase();
    }
    if (options.pathSize == null || typeof options.pathSize !== "number") {
      options.pathSize = 12;
    }
    if (!Array.isArray(options.colors) || options.colors.length === 0) {
      options.colors = ["#fa1e0e", "#8ac926", "#1982c4", "#ffca3a"];
    }
    if (options.color == null || typeof options.color !== "string") {
      options.color = options.colors[0];
    }

    options.drawKeyCode = getKeyCode(options.toggleDrawKey);
    options.boradKeyCode = getKeyCode(options.toggleBoardKey);
  }

  function draw() {
    mouse.dirty = false;
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    if (currentBoard.paths.length === 0) {
      return false;
    }
    const currentPath = currentBoard.paths[currentBoard.paths.length - 1];
    currentBoard.drawerElementContext.fillStyle = currentPath.color;
    currentBoard.drawerElementContext.strokeStyle = currentPath.color;
    currentBoard.drawerElementContext.lineWidth = currentPath.pathSize;
    // drawerElementContext.clearRect( 0, 0, drawerElement.width, drawerElement.height );
    // draw the single path
    currentBoard.drawerElementContext.stroke(currentPath);
  }

  function redraw() {
    currentBoard.drawerElementContext.clearRect(
      0,
      0,
      currentBoard.drawerElement.width,
      currentBoard.drawerElement.height
    );
    for (const pathPath of currentBoard.paths) {
      currentBoard.drawerElementContext.fillStyle = pathPath.color;
      currentBoard.drawerElementContext.strokeStyle = pathPath.color;
      currentBoard.drawerElementContext.lineWidth = pathPath.pathSize;
      currentBoard.drawerElementContext.stroke(pathPath);
    }
  }

  function trackCursor(event) {
    if (event.buttons === 1) {
      const rect = currentBoard.drawerElement.getBoundingClientRect();
      currentBoard.paths[currentBoard.paths.length - 1].lineTo(
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    }
    mouse.x = event.pageX;
    mouse.y = event.pageY;
    if (!mouse.dirty && isBoardVisible && event.buttons === 1) {
      mouse.dirty = true;
      requestAnimationFrame(draw);
    }
  }

  function disableDrawing(event) {
    draw();
    currentBoard.paths.push(new Path2D());
    currentBoard.paths[currentBoard.paths.length - 1].color = options.color;
    currentBoard.paths[currentBoard.paths.length - 1].pathSize =
      options.pathSize;
  }

  function registerCursor() {
    cursorListener = document.addEventListener("mousemove", trackCursor);
    mouseupListener = document.addEventListener("mouseup", disableDrawing);
    mouse.isVisible = true;
    colorsBoard.enablePen();
    drawerContainerElement.classList.remove("disabled");
  }

  function unregisterEventListener() {
    document.removeEventListener("mousemove", trackCursor);
    document.removeEventListener("mouseup", disableDrawing);
    cursorListener = null;
    mouse.isVisible = false;
    colorsBoard.disablePen();
    drawerContainerElement.classList.add("disabled");
    requestAnimationFrame(draw);
  }

  function initBoardElement(slideId) {
    drawerElement = (function () {
      const n = document.createElement("canvas");
      n.className = "revealjs-drawer_canvas";
      const containerElement = document.querySelector(".revealjs-drawer");
      containerElement.appendChild(n);
      return n;
    })();
    drawerElementContext = drawerElement.getContext("2d");
    drawerElementContext.canvas.width = window.innerWidth;
    drawerElementContext.canvas.height = window.innerHeight;
    drawerElementContext.imageSmoothingEnabled = true;
    boards[slideId] = {
      drawerElement: drawerElement,
      drawerElementContext: drawerElementContext,
      paths: [],
    };
    if (currentBoard.drawerElement) {
      currentBoard.drawerElement.style.display = "none";
    }
    currentBoard = boards[slideId];
    disableDrawing();
  }

  const changeColor = (newColor) => {
    options.color = newColor;
    if (eventDispatcher != null) {
      eventDispatcher({
        type: "pointerColorChange",
        data: {
          color: newColor
        },
      });
    }
    disableDrawing();
  };

  function initCanvasContainer(deck) {
    eventDispatcher = deck.dispatchEvent;
    drawerContainerElement = (function () {
      const n = document.createElement("div");
      n.className = "revealjs-drawer";
      n.style.display = "none";
      const menu = document.createElement("div");
      menu.className = "revealjs-drawer-menu";
      colorsBoard = colorContainer({
        parentElement: menu,
        colors: options.colors,
        onColorChange: changeColor,
      });

      n.append(menu);
      const slidesElement = document.querySelector(".slides");
      insertAfter(n, slidesElement);
      return n;
    })();
  }

  function togglePointerActive() {
    isPointerActive = !isPointerActive;
    if (isPointerActive) {
      registerCursor();
    } else {
      unregisterEventListener();
    }
  }

  function removeLastPath(e) {
    if (e.ctrlKey && e.key === "z") {
      const currPath = currentBoard.paths.pop();
      currentBoard.paths.pop();
      currentBoard.paths.push(currPath);
      requestAnimationFrame(redraw);
    }
  }

  function changeColorManually(e) {
    const colorKeys = options.colors.map((color, idx) => String(idx + 1));
    if (colorKeys.includes(e.key)) {
      colorsBoard.selectColor(options.colors[Number(e.key) - 1]);
    }
  }

  function registerKeys() {
    document.addEventListener("keydown", removeLastPath);
    document.addEventListener("keydown", changeColorManually);
  }

  function unregisterKeys() {
    document.removeEventListener("keydown", removeLastPath);
    document.removeEventListener("keydown", changeColorManually);
  }

  function toggleBoardVisibility() {
    drawerContainerElement.style.display =
      drawerContainerElement.style.display === "none" ? "block" : "none";
    isPointerActive = drawerContainerElement.style.display !== "none";
    if (isPointerActive) {
      registerKeys();
      registerCursor();
      isBoardVisible = true;
      if (eventDispatcher != null) {
        eventDispatcher({
          type: "pointerColorChange",
          data: {
            color: options.color
          },
        });
      }
    } else {
      unregisterKeys();
      unregisterEventListener();
      isBoardVisible = false;
      if (eventDispatcher != null) {
        eventDispatcher({
          type: "pointerColorChange",
          data: {
            color: null
          },
        });
      }
    }
  }

  function changeBoardToSlide(slideId) {
    hideCurrentBoard();
    currentBoard = boards[slideId];
    currentBoard.drawerElement.style.display = "block";
  }

  function hideCurrentBoard() {
    if (currentBoard.drawerElement) {
      currentBoard.drawerElement.style.display = "none";
    }
  }

  return {
    id: "drawer",
    init: (deck) => {
      initOptions(deck.getConfig());
      initCanvasContainer(deck);
      Reveal.on("slidetransitionend", (event) => {
        const slideId = `slide-${event.indexh}-${event.indexv}`;
        if (boards[slideId]) {
          changeBoardToSlide(slideId);
        } else {
          initBoardElement(slideId);
        }
      });
      Reveal.on("slidechanged", (event) => {
        hideCurrentBoard();
      });
      Reveal.on("ready", (event) => {
        const slideId = `slide-${event.indexh}-${event.indexv}`;
        if (boards[slideId]) {
          changeBoardToSlide(slideId);
        } else {
          initBoardElement(slideId);
        }
      });

      deck.addKeyBinding(
        { keyCode: options.drawKeyCode, key: options.toggleDrawKey },
        () => {
          togglePointerActive();
        }
      );
      deck.addKeyBinding(
        { keyCode: options.boradKeyCode, key: options.toggleBoardKey },
        () => {
          toggleBoardVisibility();
        }
      );
    },
  };
};

export default Drawer;
