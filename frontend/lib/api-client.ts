const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Token management
export const authToken = {
    get: () => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("auth_token");
    },
    set: (token: string) => {
        if (typeof window === "undefined") return;
        localStorage.setItem("auth_token", token);
    },
    clear: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    }
};

function getHeaders(): HeadersInit {
    const token = authToken.get();
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

async function handleResponse(response: Response) {
    if (response.status === 401) {
        // Token expired or invalid — clear local storage
        authToken.clear();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Something went wrong");
    }
    return response.json();
}

export const apiClient = {
    get: (endpoint: string) =>
        fetch(`${API_BASE_URL}${endpoint}`, { headers: getHeaders() }).then(handleResponse),
    post: (endpoint: string, data: any) =>
        fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    put: (endpoint: string, id: string, data: any) =>
        fetch(`${API_BASE_URL}${endpoint}/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),
    delete: (endpoint: string, id: string) =>
        fetch(`${API_BASE_URL}${endpoint}/${id}`, {
            method: "DELETE",
            headers: getHeaders(),
        }).then(handleResponse),
};

// Example usage hooks/functions can be added here
export const productsApi = {
    getAll: () => apiClient.get("/products"),
    getOne: (id: string) => apiClient.get(`/products/${id}`),
    create: (data: any) => apiClient.post("/products", data),
    update: (id: string, data: any) => apiClient.put("/products", id, data),
    delete: (id: string) => apiClient.delete("/products", id),
};

export const storesApi = {
    getAll: () => apiClient.get("/stores"),
    getOne: (id: string) => apiClient.get(`/stores/${id}`),
    create: (data: any) => apiClient.post("/stores", data),
    update: (id: string, data: any) => apiClient.put("/stores", id, data),
    delete: (id: string) => apiClient.delete("/stores", id),
};

export const categoriesApi = {
    getAll: () => apiClient.get("/categories"),
    create: (data: { name: string; description?: string }) => apiClient.post("/categories", data),
    update: (id: string, data: { name?: string; description?: string }) => apiClient.put("/categories", id, data),
    delete: (id: string) => apiClient.delete("/categories", id),
};

export const dashboardApi = {
    getStats: (params: { from?: string; to?: string } = {}) => {
        let qs = "";
        const parts = [];
        if (params.from) parts.push(`from=${params.from}`);
        if (params.to) parts.push(`to=${params.to}`);
        if (parts.length > 0) qs = "?" + parts.join("&");
        return apiClient.get(`/dashboard${qs}`);
    },
};

export const analyticsApi = {
    getSalesByStore: (params: { from?: string; to?: string } = {}) => {
        let qs = "";
        const parts = [];
        if (params.from) parts.push(`from=${params.from}`);
        if (params.to) parts.push(`to=${params.to}`);
        if (parts.length > 0) qs = "?" + parts.join("&");
        return apiClient.get(`/analytics/sales-by-store${qs}`);
    },
    getSalesByCategory: (params: { from?: string; to?: string; storeId?: string } = {}) => {
        let qs = "";
        const parts = [];
        if (params.from) parts.push(`from=${params.from}`);
        if (params.to) parts.push(`to=${params.to}`);
        if (params.storeId) parts.push(`storeId=${params.storeId}`);
        if (parts.length > 0) qs = "?" + parts.join("&");
        return apiClient.get(`/analytics/sales-by-category${qs}`);
    },
    getSalesTrend: (params: { from?: string; to?: string; storeId?: string } = {}) => {
        let qs = "";
        const parts = [];
        if (params.from) parts.push(`from=${params.from}`);
        if (params.to) parts.push(`to=${params.to}`);
        if (params.storeId) parts.push(`storeId=${params.storeId}`);
        if (parts.length > 0) qs = "?" + parts.join("&");
        return apiClient.get(`/analytics/sales-trend${qs}`);
    },
    getLowStock: (storeId?: string) => {
        const qs = storeId && storeId !== "all" ? `?storeId=${storeId}` : "";
        return apiClient.get(`/analytics/low-stock${qs}`);
    },
};

export const reportsApi = {
    getSummary: (params: { from?: string; to?: string; storeId?: string }) => {
        let qs = "";
        const parts = [];
        if (params.from) parts.push(`from=${params.from}`);
        if (params.to) parts.push(`to=${params.to}`);
        if (params.storeId) parts.push(`storeId=${params.storeId}`);
        if (parts.length > 0) qs = "?" + parts.join("&");
        return apiClient.get(`/reports/summary${qs}`);
    },
    getExportUrl: (type: "stock.pdf" | "stock.csv", storeId: string = "all") => {
        return `${API_BASE_URL}/reports/${type}?storeId=${storeId}&token=${authToken.get()}`;
    }
};

export const salesApi = {
    getAll: () => apiClient.get("/sales"),
    create: (data: any) => apiClient.post("/sales", data),
};

export const inventoryApi = {
    getAll: () => apiClient.get("/inventory"),
    update: (id: string, data: any) => apiClient.put("/inventory", id, data),
    restock: (data: { store: string; product: string; addQuantity: number; minStock?: number }) =>
        apiClient.post("/inventory/restock", data),
};

export const transfersApi = {
    getAll: () => apiClient.get("/transfers"),
    create: (data: any) => apiClient.post("/transfers", data),
    approve: (id: string) => apiClient.post(`/transfers/${id}/approve`, {}),
    reject: (id: string) => apiClient.post(`/transfers/${id}/reject`, {}),
};

export const authApi = {
    login: async (email: string, password: string) => {
        const data = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        }).then(handleResponse);
        authToken.set(data.token);
        if (typeof window !== "undefined") {
            localStorage.setItem("auth_user", JSON.stringify(data.user));
        }
        return data;
    },
    register: async (name: string, email: string, password: string) => {
        const data = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        }).then(handleResponse);
        authToken.set(data.token);
        if (typeof window !== "undefined") {
            localStorage.setItem("auth_user", JSON.stringify(data.user));
        }
        return data;
    },
    logout: () => {
        authToken.clear();
        if (typeof window !== "undefined") window.location.href = "/login";
    },
    getUser: () => {
        if (typeof window === "undefined") return null;
        const raw = localStorage.getItem("auth_user");
        return raw ? JSON.parse(raw) : null;
    },
    isAuthenticated: () => !!authToken.get(),
};
