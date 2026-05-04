const myLibrary = [];
let searchTerm = "";
let sortOption = "title";

/* MODEL */
function Book(title, author, pages, read) {
  this.id = crypto.randomUUID();
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.read = read;
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
};

/* STORAGE */
function saveLibrary() {
  localStorage.setItem("library", JSON.stringify(myLibrary));
}

function loadLibrary() {
  const data = localStorage.getItem("library");
  if (!data) return;

  JSON.parse(data).forEach(item => {
    const book = new Book(item.title, item.author, item.pages, item.read);
    book.id = item.id;
    myLibrary.push(book);
  });
}

/* CONTROLLER */
function addBookToLibrary(title, author, pages, read) {
  myLibrary.push(new Book(title, author, pages, read));
  saveLibrary();
}

/* DERIVED STATE */
function getFilteredBooks() {
  let books = [...myLibrary];

  books = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm)
  );

  if (sortOption === "title") {
    books.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortOption === "pages") {
    books.sort((a, b) => a.pages - b.pages);
  }

  if (sortOption === "read") {
    books.sort((a, b) => a.read - b.read);
  }

  return books;
}

/* VIEW */
const container = document.querySelector("#library");

function renderLibrary() {
  container.innerHTML = "";

  getFilteredBooks().forEach(book => {
    const card = document.createElement("div");
    card.className = "book";
    card.dataset.id = book.id;

    card.innerHTML = `
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <p>${book.pages} páginas</p>
      <p>${book.read ? "✔ Lido" : "❌ Não lido"}</p>
      <button class="toggle">
        ${book.read ? "Marcar como não lido" : "Marcar como lido"}
      </button>
      <button class="remove">Remover</button>
    `;

    container.appendChild(card);
  });

  updateStats();
}

/* STATS */
function updateStats() {
  const total = myLibrary.length;
  const read = myLibrary.filter(b => b.read).length;

  document.getElementById("total").textContent = `Total: ${total}`;
  document.getElementById("read").textContent = `Lidos: ${read}`;
  document.getElementById("notRead").textContent = `Pendentes: ${total - read}`;
}

/* EVENTS */
container.addEventListener("click", (e) => {
  const card = e.target.closest(".book");
  if (!card) return;

  const id = card.dataset.id;

  if (e.target.classList.contains("remove")) {
    card.style.opacity = "0";
    card.style.transform = "scale(0.8)";

    setTimeout(() => {
      const index = myLibrary.findIndex(b => b.id === id);
      myLibrary.splice(index, 1);
      saveLibrary();
      renderLibrary();
    }, 200);
  }

  if (e.target.classList.contains("toggle")) {
    const book = myLibrary.find(b => b.id === id);
    if (book) {
      book.toggleRead();
      saveLibrary();
      renderLibrary();
    }
  }
});

/* SEARCH + SORT */
document.getElementById("search").addEventListener("input", (e) => {
  searchTerm = e.target.value.toLowerCase();
  renderLibrary();
});

document.getElementById("sort").addEventListener("change", (e) => {
  sortOption = e.target.value;
  renderLibrary();
});

/* MODAL */
const modal = document.getElementById("modal");
document.getElementById("openModal").onclick = () => modal.showModal();
document.getElementById("closeModal").onclick = () => modal.close();

/* FORM */
document.getElementById("book-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const form = e.target;

  addBookToLibrary(
    form.title.value,
    form.author.value,
    Number(form.pages.value),
    form.read.checked
  );

  form.reset();
  modal.close();
  renderLibrary();
});

/* INIT */
loadLibrary();

if (myLibrary.length === 0) {
  addBookToLibrary("O Hobbit", "Tolkien", 295, false);
  addBookToLibrary("1984", "Orwell", 328, true);
}

renderLibrary();