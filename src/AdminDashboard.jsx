import { useEffect, useState } from 'react'
import axios from 'axios'
import './AdminDashboard.css'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
function AdminDashboard({ token }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE}/api/admin/products`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProducts(response.data)
        setError('')
      } catch {
        setError('Could not load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [token])

  const handleAddProduct = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!name || !price) {
      setError('Name and price are required')
      return
    }

    try {
      await axios.post(
        `${API_BASE}/api/admin/products`,
        {
          name,
          description,
          price: Number(price),
          stock: Number(stock || 0),
          image_url: imageUrl
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage('Product added')
      setName('')
      setDescription('')
      setPrice('')
      setStock('0')
      setImageUrl('')

      const response = await axios.get(`${API_BASE}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(response.data)
    } catch {
      setError('Could not add product')
    }
  }

  const handleDelete = async (id) => {
    setMessage('')
    setError('')

    try {
      await axios.delete(`${API_BASE}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessage('Product deleted')

      const response = await axios.get(`${API_BASE}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(response.data)
    } catch {
      setError('Could not delete product')
    }
  }

  return (
    <div className="admin-wrapper">
      <h2>Admin Dashboard</h2>

      <form className="admin-form" onSubmit={handleAddProduct}>
        <h3>Add Product</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" step="0.01" />
        <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" type="number" />
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" />
        <button type="submit">Add Product</button>
      </form>

      {message && <p className="admin-message">{message}</p>}
      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>${Number(product.price).toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <button
                    className="delete-btn"
                    type="button"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminDashboard

