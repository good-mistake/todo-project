import React from "react";
import { ReactComponent as Moon } from "./images/icon-moon.svg";
import { ReactComponent as Sun } from "./images/icon-sun.svg";
import { ReactComponent as Cross } from "./images/icon-cross.svg";

import { v4 as uuidv4 } from "uuid";

import { useState, useEffect, useRef } from "react";
const App = () => {
  const [theme, setTheme] = useState(0);
  const themeRef = useRef(null);
  const [items, setItems] = useState(() => {
    const storedItems = localStorage.getItem("items");
    return storedItems ? JSON.parse(storedItems) : [];
  });
  const [width, setWidth] = useState(window.innerWidth);
  const [inputValue, setInputValue] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [filter, setFilter] = useState("all");
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 0 ? 1 : 0));
  };
  const handleAddItem = () => {
    if (inputValue.trim()) {
      if (editIndex >= 0) {
        setItems((prevItems) => {
          const updatedItems = [...prevItems];
          updatedItems[editIndex] = {
            ...updatedItems[editIndex],
            text: inputValue,
          };
          return updatedItems;
        });
        setEditIndex(-1);
      } else {
        setItems((prevItems) => [
          ...prevItems,
          { id: uuidv4(), text: inputValue, completed: false },
        ]);
      }
      setInputValue("");
    }
  };

  const handleToggleComplete = (id) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      localStorage.setItem("items", JSON.stringify(updatedItems));
      return updatedItems;
    });
  };
  const handleDeleteItem = (idToDelete) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== idToDelete);
      localStorage.setItem("items", JSON.stringify(updatedItems)); // Update localStorage
      return updatedItems;
    });
  };
  const handleClearCompleted = () => {
    setItems((prevItems) => {
      const filteredItems = prevItems.filter((item) => !item.completed);
      localStorage.setItem("items", JSON.stringify(filteredItems));
      return filteredItems;
    });
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleAddItem();
    }
  };
  const handleDragStart = (event, id) => {
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (event, id) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData("text");
    if (draggedId !== id) {
      const newItems = [...items];
      const draggedIndex = newItems.findIndex((item) => item.id === draggedId);
      const dropIndex = newItems.findIndex((item) => item.id === id);
      const draggedItem = newItems[draggedIndex];
      newItems[draggedIndex] = newItems[dropIndex];
      newItems[dropIndex] = draggedItem;
      setItems(newItems);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "active") return !item?.completed;
    if (filter === "completed") return item?.completed;
    return true;
  });
  const itemsLeft = items.filter((item) => !item?.completed).length;

  useEffect(() => {
    switch (theme) {
      case 0:
        document.body.className = "light-theme";
        if (themeRef.current) themeRef.current.className = "";

        break;
      case 1:
        document.body.className = "dark-theme";
        if (themeRef.current) themeRef.current.className = "dark-theme";
        break;

      default:
        document.body.className = "";
        if (themeRef.current) themeRef.current.className = "";
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <>
      <header>
        <div>
          {" "}
          <h1>TODO</h1>
          <div onClick={toggleTheme}>{theme === 0 ? <Moon /> : <Sun />}</div>
        </div>
      </header>
      <main className="container">
        <div className="user-input" ref={themeRef}>
          <input
            type="text"
            placeholder="Create a new todo..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div>
          <ul ref={themeRef}>
            {filteredItems.map((item) => (
              <li
                key={item.id}
                ref={themeRef}
                onClick={() => handleToggleComplete(item.id)}
                onDragStart={(event) => handleDragStart(event, item.id)}
                onDrop={(event) => handleDrop(event, item.id)}
                onDragOver={handleDragOver}
                draggable
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleComplete(item)}
                />

                {width < 410 ? (
                  <div className="text-delete">
                    <span className={item.completed ? "completed" : ""}>
                      {item.text}
                    </span>
                    <button onClick={() => handleDeleteItem(item.id)}>
                      <Cross />
                    </button>
                  </div>
                ) : (
                  <span className={item.completed ? "completed" : ""}>
                    {item.text}
                  </span>
                )}
              </li>
            ))}{" "}
            <li className="button-options">
              <div>{itemsLeft} items left</div>
              {width > 410 ? (
                <div>
                  <button
                    onClick={() => setFilter("all")}
                    className={filter === "all" ? "active-filter" : ""}
                  >
                    All
                  </button>{" "}
                  <button
                    onClick={() => setFilter("active")}
                    className={filter === "active" ? "active-filter" : ""}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setFilter("completed")}
                    className={filter === "completed" ? "active-filter" : ""}
                  >
                    Completed
                  </button>
                </div>
              ) : (
                ""
              )}

              <button onClick={handleClearCompleted}>Clear Completed</button>
            </li>{" "}
            {width < 410 ? (
              <div className="buttons">
                <button
                  onClick={() => setFilter("all")}
                  className={filter === "all" ? "active-filter" : ""}
                >
                  All
                </button>{" "}
                <button
                  onClick={() => setFilter("active")}
                  className={filter === "active" ? "active-filter" : ""}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter("completed")}
                  className={filter === "completed" ? "active-filter" : ""}
                >
                  Completed
                </button>
              </div>
            ) : (
              ""
            )}
          </ul>
        </div>
      </main>
    </>
  );
};

export default App;
