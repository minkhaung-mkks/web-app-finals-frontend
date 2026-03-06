import { useEffect, useMemo, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import BookDetail from "./BookDetail";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [bookLocation, setBookLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalMode, setModalMode] = useState("close");

  const [titleFilter, setTitleFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");

  const { user } = useUser();

  useEffect(() => {
    fetch("http://localhost:3000/api/book", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`
      },
      credentials: "include"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setBooks(data.items || []);
      })
      .catch((error) => console.error("Error fetching books:", error));
  }, [user, refresh]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesTitle = (book.Title || "")
        .toLowerCase()
        .includes(titleFilter.toLowerCase());

      const matchesAuthor = (book.Author || "")
        .toLowerCase()
        .includes(authorFilter.toLowerCase());

      return matchesTitle && matchesAuthor;
    });
  }, [books, titleFilter, authorFilter]);

  const handleCreateBook = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        credentials: "include",
        body: JSON.stringify({
          title,
          author,
          quantity,
          location: bookLocation
        })
      });

      console.log(response);

      if (!response.ok) {
        if (response.status === 403) {
          alert("Your account don't have permissions");
        }
        throw new Error(`Create failed: ${response.status}`);
      }

      setRefresh(!refresh);
      setTitle("");
      setAuthor("");
      setQuantity("");
      setBookLocation("");
      setModalMode("close");
    } catch (error) {
      console.error("Error creating book:", error);
    }
  };

  const handleEditBookModal = (book) => {
    setSelectedBook(book);
    setModalMode("edit");
  };

  const handleRefresh = () => {
    setRefresh((prev) => !prev);
  };

  const closeModal = () => {
    setModalMode("close");
    setSelectedBook(null);
    setTitle("");
    setAuthor("");
    setQuantity("");
    setBookLocation("");
  };

  return (
    <div>
      <h1>Books</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Filter by title"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by author"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <table className="books-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Quantity</th>
              <th>Location</th>
              {user.role === "ADMIN" && <th>Status</th>}
              {user.role === "ADMIN" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book._id}>
                <td>{book.Title || "Untitled Book"}</td>
                <td>{book.Author || "Unknown Author"}</td>
                <td>{book.Quantity || 0}</td>
                <td>{book.Location || "-"}</td>
                {user.role === "ADMIN" && <td>{book.Status || "-"}</td>}
                {user.role === "ADMIN" && (
                  <td>
                    <button onClick={() => handleEditBookModal(book)}>
                      Manage
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {user.role == "ADMIN" && (
        <>
          <button onClick={() => setModalMode("Create")}>Create Book</button>

          {modalMode === "Create" && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h2>Create Book</h2>

                <form onSubmit={handleCreateBook}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      min={0}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={bookLocation}
                      onChange={(e) => setBookLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit">Save</button>
                    <button type="button" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {modalMode === "edit" && selectedBook && (
            <BookDetail
              book={selectedBook}
              user={user}
              onClose={closeModal}
              onRefresh={handleRefresh}
            />
          )}
        </>
      )}
    </div>
  );
}