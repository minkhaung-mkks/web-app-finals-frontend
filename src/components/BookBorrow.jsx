
import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserProvider";

export default function BookBorrow() {
  //TODO: Implement your book request service here
  const { user } = useUser();
  const API_URL = import.meta.env.VITE_API_URL;

  const [requests, setRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    bookId: "",
    pickupDate: "",
  });

  const fetchRequests = async () => {

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/borrow`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch borrow requests");
      }

      setRequests(data.items || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/book`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        credentials: "include"
      });
  
      const data = await response.json();
      console.log(data);
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch books");
      }
  
      const activeBooks = (data.items || []).filter(
        book => (book.Status) === "ACTIVE"
      );
  
      setBooks(activeBooks);
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {

      fetchRequests();
      fetchBooks();
    console.log(user)
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateRequest = async e => {
    e.preventDefault();
    setMessage("");

    if (!form.bookId || !form.pickupDate) {
      setMessage("Please select a book and pickup date");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          bookId: form.bookId,
          pickupDate: form.pickupDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create borrow request");
      }

      setMessage("Borrow request created successfully");
      setForm({
        bookId: "",
        pickupDate: "",
      });

      fetchRequests();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleStatusUpdate = async (id, requestStatus) => {
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/borrow`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        credentials: "include",
        body: JSON.stringify({
          id,
          requestStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update request");
      }

      setMessage("Request updated successfully");
      fetchRequests();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!user?.isLoggedIn) {
    return <p>Please log in first.</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Borrow Requests</h1>

      {message && <p>{message}</p>}

     
        <div style={{ marginBottom: "30px", border: "1px solid #ccc", padding: "16px" }}>
          <h2>Create Borrow Request</h2>

          <form onSubmit={handleCreateRequest}>
            <div style={{ marginBottom: "12px" }}>
              <label>Book</label>
              <br />
              <select
                name="bookId"
                value={form.bookId}
                onChange={handleChange}
              >
                <option value="">Select a book</option>
                {books.map(book => (
                  <option key={book._id} value={book._id}>
                    {book.title || book.Title} - {book.author || book.Author}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Pickup Date</label>
              <br />
              <input
                type="date"
                name="pickupDate"
                value={form.pickupDate}
                onChange={handleChange}
              />
            </div>

            <button type="submit">Create Request</button>
          </form>
        </div>


      <div>
        <h2>Request List</h2>

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>UserID</th>
                <th>BookID</th>
                <th>Status</th>
                <th>Pickup Date</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request._id}>
                  <td>{request._id}</td>
                  <td>{request.UserID}</td>
                  <td>{request.BookID}</td>
                  <td>{request.RequestStatus}</td>
                  <td>{request.TargetDate}</td>
                  <td>{request.CreatedAt}</td>
                  <td>
                    {user.role?.toLowerCase() === "user" && (request.RequestStatus == "ACCEPTED" || request.RequestStatus == "INIT") && (
                      <button
                        onClick={() => handleStatusUpdate(request._id, "CANCEL-USER")}
                        style={{ marginRight: "8px" }}
                      >
                        Cancel Request
                      </button>
                    )}
                    {user.role?.toLowerCase() === "admin" && (request.RequestStatus == "ACCEPTED" || request.RequestStatus == "INIT") && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(request._id, "CLOSE-NO-AVAILABLE-BOOK")}
                          style={{ marginRight: "8px" }}
                        >
                          No more books
                        </button>
                        {request.UserID == user.id ? (
                          <button
                            onClick={() => handleStatusUpdate(request._id, "CANCEL-USER")}
                            style={{ marginRight: "8px" }}
                          >
                            Cancel Request
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(request._id, "CANCEL-ADMIN")}
                            style={{ marginRight: "8px" }}
                          >
                            Cancel as ADMIN
                          </button>
                        )}
                    {(request.RequestStatus == "INIT") && (
                      <button
                        onClick={() => handleStatusUpdate(request._id, "ACCEPTED")}
                        style={{ marginRight: "8px" }}
                      >
                        Approve Request
                      </button>
                    )}

                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
