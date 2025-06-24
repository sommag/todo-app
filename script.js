function addTodo() {
  const input = document.getElementById("todoInput");
  const list = document.getElementById("todoList");
  const item = document.createElement("li");
  item.textContent = input.value;
  list.appendChild(item);
  input.value = "";
}
.