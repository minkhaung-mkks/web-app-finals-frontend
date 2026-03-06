import { useEffect, useState } from 'react';
import './App.css'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import RequireAuth from './middleware/RequireAuth';
// import Profile from './components/Profile';
import Login from './components/Login';
import Logout from './components/Logout';
import Books from './components/Books';
import { useUser } from './contexts/UserProvider';
import BookBorrow from './components/BookBorrow';

function App() {
  const { user, logout } = useUser()
  return (
    <>
     <header className="app-nav">
        <div className="nav-brand">React Next Test</div>
        <div className="nav-center">
          <nav className="nav-links">
            <NavLink to="/books" end>Books</NavLink>
            <NavLink to="/borrow" end>Borrow A book</NavLink>
            {/* {user?.role === 'ADMIN' && <NavLink to="/users">Users</NavLink>} */}
          </nav>
        </div>
        <div className="nav-actions">
          {user?.isLoggedIn ? (
            <>
              <NavLink className="nav-text" to="/logout" onClick={logout}>Logout</NavLink>
            </>
          ) : (
            <NavLink className="nav-text" to="/login">Login</NavLink>
          )}
        </div>
      </header>
      <main>
      <Routes>
      <Route path='/' element={<Navigate to="/books" />} />
      <Route path='/login' element={<Login />} />
      <Route path='/logout' element={
        <RequireAuth>
          <Logout />
        </RequireAuth>
      } />
      //TODO: Add your route here
      <Route path='/books' element={
        <RequireAuth>
          <Books />
        </RequireAuth>
      } />
      <Route path='/borrow' element={
        <RequireAuth>
          <BookBorrow />
        </RequireAuth>
      } />
    </Routes>
      </main>
    </>
    
  );
}

export default App
