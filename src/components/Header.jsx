import { Link, NavLink } from 'react-router-dom';
import { signOut, useSession } from '../services/auth';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { data: session, isPending } = useSession();
  const { count } = useCart();
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">Grocery Portal</Link>
        <nav>
          <NavLink to="/" end>Shop</NavLink>
          <NavLink to="/cart" className="cart-link">Basket{count > 0 && <span className="badge">{count}</span>}</NavLink>
          <NavLink to="/my-orders">My orders</NavLink>
          <NavLink to="/lookup">Find order</NavLink>
          {!isPending && (session ? (
            <>
              <span className="muted small">{session.user.name}</span>
              <button type="button" className="link-button" onClick={() => signOut()}>Sign out</button>
            </>
          ) : (
            <NavLink to="/signin">Sign in</NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
