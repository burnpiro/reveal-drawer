const defaultColorSetting = {
  parentElement: null,
  color: "red",
  selected: false,
  onClick: null,
};

const defaultContainerSetting = {
  parentElement: null,
  colors: ["red", "blue", "green", "yellow"],
  onColorChange: null,
};

const colorSelector = ({
  parentElement,
  color,
  selected,
  onClick,
} = defaultColorSetting) => {
  const settings = {
    color: color,
    selected: selected,
  };
  if (parentElement == null) {
    console.error("Please provide parent element for color selector");
  }

  const onSelect = function () {
    if (onClick != null) {
      onClick(settings.color);
    }
    settings.selected = true;
  };

  const unSelect = () => {
    selected.settings = false;
  };

  settings.element = document.createElement("div");
  settings.element.className = "revealjs-drawer-color_picker";
  settings.element.style.backgroundColor = color;
  settings.element.addEventListener("click", onSelect);
  parentElement.append(settings.element);

  return {
    unSelect,
    select: onSelect,
  };
};

const penIconElement = ({ parentElement = null }) => {
  if (parentElement == null) {
    console.error("Please provide parent element for color container");
  }

  const penIcon = document.createElement("div");
  penIcon.className = "revealjs-drawer-pen_icon";
  parentElement.append(penIcon);

  const changeColor = (newColor) => {
    penIcon.style.backgroundColor = newColor;
  };

  return {
    changeColor,
    disable: () => {
      penIcon.classList.add("disabled");
    },
    enable: () => {
      penIcon.classList.remove("disabled");
    },
  };
};

const colorContainer = ({
  parentElement,
  colors,
  onColorChange,
} = defaultContainerSetting) => {
  if (parentElement == null) {
    console.error("Please provide parent element for color container");
  }
  const penElement = penIconElement({ parentElement });
  const iconContainer = document.createElement("div");
  iconContainer.className = "revealjs-drawer-color_container";
  parentElement.append(iconContainer);

  const changeSelectedColor = (newColor) => {
    settings.selectColor = newColor;
    if (onColorChange != null) {
      onColorChange(newColor);
    }
    penElement.changeColor(newColor);
  };

  const settings = {
    selectedColor: colors[0],
    colors: colors.reduce((acc, color) => {
      acc[color] = colorSelector({
        parentElement: iconContainer,
        color,
        selected: color === colors[0],
        onClick: changeSelectedColor,
      });
      return acc;
    }, {}),
  };
  penElement.changeColor(settings.selectedColor);

  const selectColor = (color) => {
    settings.colors[color].select();
  };

  return {
    selectColor,
    disablePen: () => {
      penElement.disable();
    },
    enablePen: () => {
      penElement.enable();
    },
  };
};

export default colorContainer;
