"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/navbar";
import styles from "./fetchProduct.module.css";
import LoadingSpinner from "../../components/loadingSpinner/loadingSpinner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ProductFetcher() {
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const params = useSearchParams();
  const date = params.get("date");
  const [from, setFrom] = useState("it");
  const router = useRouter();

  const searchProducts = async() => {
    setLoading(true);
    setError(null);
    let response; // Declare response outside the try block
    try {

      response = await fetch(
        `https://${from}.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&action=process&json=1`,
        {
          method: "GET",
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
  }, [productName, from]);

  const pushWithParams = (id) => {
    const params = new URLSearchParams({ id: id , date: date});
    router.push(`/logFood/fetchProduct/productDetails?${params.toString()}`);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.titleContainer}>
      <input
        type="text"
        value={productName}
        className={styles.inputField}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Enter product name..."
      />
      <div className={styles.fromContainer}>
        <button onClick={() => setFrom("world")} className={`${styles.buttonFrom} ${from === "world" ? styles.active : ""}`}>
          World
        </button>
        <button onClick={() => setFrom("it")} className={`${styles.buttonFrom} ${from === "it" ? styles.active : ""}`}>
          Ita
        </button>
      </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className={styles.error}>Error: {error}</p>}

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

export default function ProductFetch(){
  return (
    <Suspense>
      <ProductFetcher />
    </Suspense>
  );
}