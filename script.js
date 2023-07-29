
  document.addEventListener("DOMContentLoaded", () => {
    const linkForm = document.getElementById("linkForm");
    const gridContainer = document.getElementById("gridContainer");
    let draggedLink;

    const saveLinksToStorage = () => {
      const links = Array.from(gridContainer.children).map((gridItem) => gridItem.firstElementChild.outerHTML);
      localStorage.setItem("links", JSON.stringify(links));
    };

    const loadLinksFromStorage = () => {
      const savedLinks = JSON.parse(localStorage.getItem("links")) || [];
      savedLinks.forEach((linkHTML) => {
        const gridItem = createLinkContainer(linkHTML);
        gridContainer.appendChild(gridItem);
      });
    };

    const deleteLink = (linkElement) => {
      const gridItem = linkElement.parentElement;
      gridContainer.removeChild(gridItem);
      saveLinksToStorage();
    };

    const createLinkContainer = (linkHTML) => {
      const linkElement = document.createElement("a");
      linkElement.innerHTML = linkHTML;

      const gridItem = document.createElement("div");
      gridItem.classList.add("grid-item");

      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("click", () => deleteLink(linkElement));

      gridItem.appendChild(linkElement);
      gridItem.appendChild(deleteButton);

      gridItem.draggable = true;
      gridItem.addEventListener("dragstart", (e) => {
        draggedLink = gridItem;
        e.dataTransfer.setData("text/plain", gridItem.id);
        setTimeout(() => {
          gridItem.classList.add("dragging");
        }, 0);
      });
      gridItem.addEventListener("dragend", () => {
        draggedLink = null;
        gridItem.classList.remove("dragging");
        saveLinksToStorage();
      });

      return gridItem;
    };

    loadLinksFromStorage();

    linkForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const linkURL = document.getElementById("linkURL").value;
      const linkText = document.getElementById("linkText").value;

      const linkElement = document.createElement("a");
      linkElement.href = linkURL;
      linkElement.innerText = linkText;

      if (gridContainer.children.length < 25) {
        const gridItem = createLinkContainer(linkElement.outerHTML);
        gridContainer.appendChild(gridItem);
        saveLinksToStorage();
      } else {
        alert("The grid is full. You cannot add more links.");
      }

      linkForm.reset();
    });

    gridContainer.addEventListener("dragover", (e) => {
      e.preventDefault();
      const dragItem = document.querySelector(".dragging");
      if (dragItem && dragItem !== e.target) {
        e.dataTransfer.dropEffect = "move";
      }
    });

    gridContainer.addEventListener("dragenter", (e) => {
      const dragItem = document.querySelector(".dragging");
      if (dragItem && dragItem !== e.target) {
        e.target.classList.add("drag-over");
      }
    });

    gridContainer.addEventListener("dragleave", (e) => {
      e.target.classList.remove("drag-over");
    });

    gridContainer.addEventListener("drop", (e) => {
      e.preventDefault();
      const linkId = e.dataTransfer.getData("text/plain");
      const linkElement = document.getElementById(linkId);

      if (linkElement) {
        const targetGridItem = e.target.closest(".grid-item");
        if (targetGridItem && draggedLink !== targetGridItem) {
          const allGridItems = Array.from(gridContainer.children);
          const draggedIndex = allGridItems.indexOf(draggedLink);
          const targetIndex = allGridItems.indexOf(targetGridItem);

          if (draggedIndex !== -1 && targetIndex !== -1) {
            if (draggedIndex < targetIndex) {
              gridContainer.insertBefore(draggedLink, targetGridItem.nextSibling);
            } else {
              gridContainer.insertBefore(draggedLink, targetGridItem);
            }

            saveLinksToStorage();
          }
        }

        e.target.classList.remove("drag-over");
      }
    });
  });
