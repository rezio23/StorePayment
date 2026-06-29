import { useFetch } from "../hooks/useFetch";

const PRODUCT_URL = import.meta.env.VITE_PRODUCT_URL

export default function Products(){
    const { data: response, loading, error } = useFetch(PRODUCT_URL)
    const products = response?.data

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error}...</p>
    if (!products || products.length === 0) return <p>No product found.</p>

    return(
        <ul>
            {products.map((product) => (
            <li key={product.ProID}>
                {product.ProName} - ${product.Price} (Qty: {product.Qty})
            </li>
            ))}
        </ul>
    )
}