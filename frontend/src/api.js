function getCSRFToken() {
  // Standard Frappe token
  if (window.frappe?.csrf_token) {
    return window.frappe.csrf_token;
  }

  // Some Frappe pages expose it directly
  if (window.csrf_token) {
    return window.csrf_token;
  }

  // Try frappe boot data
  if (window.frappe?.boot?.csrf_token) {
    return window.frappe.boot.csrf_token;
  }

  return null;
}

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const csrfToken = getCSRFToken();

  if (csrfToken) {
    headers["X-Frappe-CSRF-Token"] = csrfToken;
  }

  return headers;
}


async function handleResponse(res) {
  const data = await res.json();

  if (!res.ok) {
    console.error("API Error:", data);

    throw new Error(
      data.exception ||
      data.message ||
      "Something went wrong while processing the request."
    );
  }

  return data;
}


export async function fetchCategories() {
  try {
    const res = await fetch(
      '/api/resource/Product%20Category?fields=["name","category_name","slug","category_image","description"]&filters=[["is_active","=",1]]',
      {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    const data = await handleResponse(res);

    return data.data || [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}


export async function fetchProducts() {
  try {
    const res = await fetch(
      '/api/resource/Product?fields=["name","product_name","category","starting_price","offer_price","show_price","thumbnail_image","main_image","short_description","is_featured","is_best_seller","product_weight_label","default_egg_type","serves","is_eggless_available"]&filters=[["is_active","=",1]]',
      {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    const data = await handleResponse(res);

    return data.data || [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export async function fetchProductDetails(productName) {
  try {
    const res = await fetch(
      `/api/resource/Product/${encodeURIComponent(productName)}`,
      {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    const data = await handleResponse(res);
    return data.data || null;
  } catch (err) {
    console.error("Error fetching single product details:", err);
    return null;
  }
}


export async function submitOrder(orderPayload) {
  try {
    const csrfToken = getCSRFToken();

    console.log("CSRF Token available:", !!csrfToken);

    const res = await fetch(
      "/api/resource/Customer%20Order",
      {
        method: "POST",
        headers: getHeaders(),
        credentials: "same-origin",
        body: JSON.stringify(orderPayload),
      }
    );

    return await handleResponse(res);

  } catch (err) {
    console.error("Error submitting order:", err);
    throw err;
  }
}


export async function submitCustomCakeRequest(payload) {
  try {
    const csrfToken = getCSRFToken();

    console.log("CSRF Token available:", !!csrfToken);

    const res = await fetch(
      "/api/resource/Custom%20Cake%20Request",
      {
        method: "POST",
        headers: getHeaders(),
        credentials: "same-origin",
        body: JSON.stringify(payload),
      }
    );

    return await handleResponse(res);

  } catch (err) {
    console.error("Error submitting custom cake request:", err);
    throw err;
  }
}


export async function checkOrderStatus(orderId) {
  try {
    const res = await fetch(
      `/api/resource/Customer%20Order/${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!res.ok) {
      return {
        error: `Order ${orderId} not found.`,
      };
    }

    const data = await res.json();
    return data.data || null;

  } catch (err) {
    console.error("Error checking order status:", err);
    return {
      error: `Unable to fetch status for ${orderId}`,
    };
  }
}

export async function fetchCustomerDetails(query) {
  try {
    const res = await fetch(
      `/api/method/sugar_rush_bakes.sugar_rush_bakes.doctype.customer_order.customer_order.get_customer_by_query?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.message || null;
  } catch (err) {
    console.error("Error fetching customer details:", err);
    return null;
  }
}

export async function createNewCustomer(payload) {
  try {
    const res = await fetch(
      "/api/method/sugar_rush_bakes.sugar_rush_bakes.doctype.customer_order.customer_order.create_customer",
      {
        method: "POST",
        headers: getHeaders(),
        credentials: "same-origin",
        body: JSON.stringify(payload),
      }
    );

    const data = await handleResponse(res);
    return data.message || null;
  } catch (err) {
    console.error("Error creating customer:", err);
    throw err;
  }
}

export async function extractUtrFromScreenshot(imageData) {
  try {
    const res = await fetch(
      "/api/method/sugar_rush_bakes.sugar_rush_bakes.doctype.customer_order.customer_order.extract_utr_from_image",
      {
        method: "POST",
        headers: getHeaders(),
        credentials: "same-origin",
        body: JSON.stringify({ image_data: imageData }),
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.message || null;
  } catch (err) {
    console.error("Error extracting UTR from image:", err);
    return null;
  }
}