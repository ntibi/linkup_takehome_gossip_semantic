# Project Setup & Usage

This project was developed and tested using **Node.js v22.20.0**.

> **Note:**  
> Test coverage and error handling are currently minimal.

---

## Quickstart

1. **Start Data Sources:**
    ```sh
    docker compose up
    ```
2. **Run the Crawler:**  
   Indexes the data and embeds the first 100 pages.
    ```sh
    npm run crawl
    ```
3. **Start the Server:**  
   Runs the server on `localhost:4000`.
    ```sh
    npm run dev
    ```
4. **Test the Search Endpoint:**
    ```sh
    curl 'localhost:4000/search?q="nouveau%20film"'
    # For pretty JSON output:
    curl 'localhost:4000/search?q="nouveau%20film"' | jq .
    ```

---
