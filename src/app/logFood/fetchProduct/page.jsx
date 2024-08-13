"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/navbar";
import styles from "./fetchProduct.module.css";
/* import { BarcodeScanner } from 'react-barcode-scanner'
import "react-barcode-scanner/polyfill" */

function ProductFetcher() {
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const searchProducts = async() => {
    setLoading(true);
    setError(null);

    const customUserAgent = "gymBuddy/1.2 (pioesposito2003@gmail.com)";

    let response; // Declare response outside the try block
    try {
      const defaultUserAgent = navigator.userAgent;
      // Combine the default User-Agent with the custom User-Agent
      const combinedUserAgent = `${defaultUserAgent} ${customUserAgent}`;

      response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&action=process&json=1`,
        {
          method: "GET",
          mode: "cors",
          headers: {
            "User-Agent": combinedUserAgent,
          },
        }
      );
      const data = await response.json();
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (productName) {
        searchProducts();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [productName]);

  const pushWithParams = (id) => {
    const params = new URLSearchParams({ id: id });
    router.push(`/logFood/fetchProduct/productDetails?${params.toString()}`);
  };

  return (
    <main className={styles.mainContainer}>
      <input
        type="text"
        value={productName}
        className={styles.inputField}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Enter product name..."
      />

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>Error: {error.message}</p>}

      {!loading && products.length > 0 && (
        <div className={styles.productList}>
          {products
            .filter(
              (product) =>
                product.nutriments.carbohydrates_100g !== undefined &&
                product.nutriments.fat_100g !== undefined &&
                product.nutriments.proteins_100g !== undefined
            )
            .map((product) => (
              <div key={product.id} className={styles.product}>
                <p
                  onClick={() => pushWithParams(product._id)}
                  className={styles.productName}
                >
                  {product.product_name}
                </p>
              </div>
            ))}
        </div>
      )}
      <Navbar />
    </main>
  );
}

export default ProductFetcher;