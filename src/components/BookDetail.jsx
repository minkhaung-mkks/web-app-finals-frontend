import { useEffect, useState } from "react";

export default function BookDetail({ book, user, onClose, onRefresh }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [bookLocation, setBookLocation] = useState("");
  const [bookStatus, setBookStatus] = useState("");

  useEffect(() => {
    if (book) {
      setTitle(book.Title || "");
      setAuthor(book.Author || "");
      setQuantity(book.Quantity || 0);
      setBookLocation(book.Location || "");
      setBookStatus(book.Status)
    }
  }, [book]);

  if (!book) return null;

  const handleEditBook = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/book/" + book._id, {
        method: "PATCH",
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

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }

      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const handleDeleteBook = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/book/" + book._id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleReinstateBook = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/book/" + book._id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        credentials: "include",
        body: JSON.stringify({
          status: "ACTIVE"
        })
      });

      if (!response.ok) {
        throw new Error(`Reinstate failed: ${response.status}`);
      }

      onRefresh();
      onClose();
    } catch (error) {
      console.error("Error reinstating book:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Manage Book</h2>
        <h5>Current Status: {bookStatus}</h5>
        <form onSubmit={handleEditBook}>
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
            <button type="submit">Update</button>

            {book.Status === "ACTIVE" ? (
              <button type="button" onClick={handleDeleteBook}>
                Delete
              </button>
            ) : (
              <button type="button" onClick={handleReinstateBook}>
                Un-delete
              </button>
            )}

            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}